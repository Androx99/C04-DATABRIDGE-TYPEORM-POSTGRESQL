import { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Evento = {
  id: number;
  nombre: string;
  ciudad: string;
  categoria: string;
  fecha: string;
};

const API_URL = 'http://192.168.1.133:3000';

export default function App() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [ciudad, setCiudad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cargando, setCargando] = useState(false);

  async function filtrar(filtroCiudad?: string, filtroCategoria?: string) {
    const c = filtroCiudad !== undefined ? filtroCiudad : ciudad;
    const cat = filtroCategoria !== undefined ? filtroCategoria : categoria;

    setCargando(true);
    try {
      const queryParams: string[] = [];
      if (c && c.trim()) queryParams.push(`ciudad=${encodeURIComponent(c.trim())}`);
      if (cat && cat.trim()) queryParams.push(`categoria=${encodeURIComponent(cat.trim())}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const r = await fetch(API_URL + '/eventos' + queryString);
      if (!r.ok) throw new Error('Error al consultar la API');
      setEventos(await r.json());
    } catch {
      // Manejo de error de conexión
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    filtrar('', '');
  }, []);

  function aplicarFiltroRapido(c: string, cat: string) {
    setCiudad(c);
    setCategoria(cat);
    filtrar(c, cat);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎟️ Event Radar</Text>
      <Text style={styles.subtitle}>Filtra eventos combinando ciudad y categoría</Text>

      {/* Tarjeta de filtros */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Filtros de búsqueda</Text>

        <TextInput
          style={styles.input}
          placeholder="Ciudad (ej. Zaragoza)"
          value={ciudad}
          onChangeText={setCiudad}
        />
        <TextInput
          style={styles.input}
          placeholder="Categoría (ej. Tecnologia)"
          value={categoria}
          onChangeText={setCategoria}
        />

        <View style={styles.filterActions}>
          <Button title="Buscar" onPress={() => filtrar()} />
          <Button
            title="Limpiar"
            color="#64748B"
            onPress={() => aplicarFiltroRapido('', '')}
          />
        </View>

        {/* Accesos rápidos de filtros combinados */}
        <Text style={styles.quickLabel}>Atajos rápidos:</Text>
        <View style={styles.quickFilters}>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => aplicarFiltroRapido('', '')}
          >
            <Text style={styles.pillText}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => aplicarFiltroRapido('Zaragoza', 'Tecnologia')}
          >
            <Text style={styles.pillText}>Zaragoza · Tech</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => aplicarFiltroRapido('Zaragoza', 'Musica')}
          >
            <Text style={styles.pillText}>Zaragoza · Música</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => aplicarFiltroRapido('Madrid', 'Tecnologia')}
          >
            <Text style={styles.pillText}>Madrid · Tech</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Listado de eventos */}
      {cargando ? (
        <Text style={styles.cargandoText}>Buscando eventos...</Text>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay eventos que coincidan con la búsqueda.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.eventName}>{item.nombre}</Text>
                <Text style={styles.categoryBadge}>{item.categoria}</Text>
              </View>
              <Text style={styles.details}>📍 {item.ciudad}</Text>
              <Text style={styles.date}>📅 {item.fecha}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  title: { fontSize: 30, fontWeight: '800', color: '#0F172A' },
  subtitle: { color: '#64748B', fontSize: 14, marginBottom: 16, marginTop: 4 },
  filterCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 16 },
  filterTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#1E293B' },
  input: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 15 },
  filterActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginBottom: 12 },
  quickLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  quickFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: '#E2E8F0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  pillText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  list: { paddingBottom: 24 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  eventName: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },
  categoryBadge: { fontSize: 12, fontWeight: '700', color: '#0284C7', backgroundColor: '#E0F2FE', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  details: { fontSize: 15, color: '#334155', marginBottom: 4 },
  date: { fontSize: 13, color: '#64748B' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 24, fontStyle: 'italic' },
  cargandoText: { textAlign: 'center', color: '#64748B', marginTop: 20 },
});

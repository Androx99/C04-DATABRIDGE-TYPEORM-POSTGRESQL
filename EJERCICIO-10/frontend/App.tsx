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

type Destino = {
  id: number;
  ciudad: string;
  pais: string;
  descripcion: string;
  visitado: boolean;
};

const API_URL = 'http://192.168.1.133:3000';

export default function App() {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'pendientes' | 'visitados'>('todos');
  const [error, setError] = useState('');

  async function request(url: string, options?: RequestInit) {
    const r = await fetch(url, options);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r;
  }

  async function cargar(tipoFiltro = filtro) {
    try {
      let query = '';
      if (tipoFiltro === 'visitados') query = '?visitado=true';
      if (tipoFiltro === 'pendientes') query = '?visitado=false';

      const r = await request(API_URL + '/destinos' + query);
      setDestinos(await r.json());
      setError('');
    } catch {
      setError('No se pudieron cargar los destinos desde la API.');
    }
  }

  useEffect(() => {
    cargar('todos');
  }, []);

  function cambiarFiltro(nuevoFiltro: 'todos' | 'pendientes' | 'visitados') {
    setFiltro(nuevoFiltro);
    cargar(nuevoFiltro);
  }

  async function crear() {
    if (!ciudad.trim() || !pais.trim()) {
      setError('Escribe al menos la ciudad y el país.');
      return;
    }
    try {
      await request(API_URL + '/destinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ciudad: ciudad.trim(),
          pais: pais.trim(),
          descripcion: descripcion.trim() || 'Destino por descubrir',
          visitado: false,
        }),
      });
      setCiudad('');
      setPais('');
      setDescripcion('');
      await cargar();
    } catch {
      setError('No se pudo guardar el destino.');
    }
  }

  async function toggleVisitado(id: number) {
    try {
      await request(API_URL + '/destinos/' + id + '/toggle', {
        method: 'PATCH',
      });
      await cargar();
    } catch {
      setError('No se pudo actualizar el estado de visita.');
    }
  }

  async function eliminar(id: number) {
    try {
      await request(API_URL + '/destinos/' + id, { method: 'DELETE' });
      await cargar();
    } catch {
      setError('No se pudo eliminar el destino.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🌍 Wander</Text>
      <Text style={styles.subtitle}>Tu diario de viajes y destinos soñados</Text>

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      {/* Formulario de creación */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Añadir nuevo destino</Text>
        <TextInput
          style={styles.input}
          placeholder="Ciudad (ej. Kioto)"
          value={ciudad}
          onChangeText={setCiudad}
        />
        <TextInput
          style={styles.input}
          placeholder="País (ej. Japón)"
          value={pais}
          onChangeText={setPais}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción o qué visitar"
          value={descripcion}
          onChangeText={setDescripcion}
        />
        <Button title="Guardar destino" onPress={crear} />
      </View>

      {/* Pestañas de filtro por estado de visita */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.pill, filtro === 'todos' && styles.pillActive]}
          onPress={() => cambiarFiltro('todos')}
        >
          <Text style={[styles.pillText, filtro === 'todos' && styles.pillTextActive]}>
            Todos ({destinos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, filtro === 'pendientes' && styles.pillActive]}
          onPress={() => cambiarFiltro('pendientes')}
        >
          <Text style={[styles.pillText, filtro === 'pendientes' && styles.pillTextActive]}>
            ✈️ Pendientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, filtro === 'visitados' && styles.pillActive]}
          onPress={() => cambiarFiltro('visitados')}
        >
          <Text style={[styles.pillText, filtro === 'visitados' && styles.pillTextActive]}>
            ✓ Visitados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Listado de tarjetas de destinos */}
      <FlatList
        data={destinos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay destinos en esta categoría.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.destinationTitle}>
                {item.ciudad}, {item.pais}
              </Text>
              <Text style={item.visitado ? styles.badgeVisitado : styles.badgePendiente}>
                {item.visitado ? '✓ Visitado' : '✈️ Pendiente'}
              </Text>
            </View>

            <Text style={styles.descriptionText}>{item.descripcion}</Text>

            <View style={styles.actions}>
              <Button
                title={item.visitado ? 'Marcar pendiente' : 'Marcar visitado'}
                color={item.visitado ? '#64748B' : '#16A34A'}
                onPress={() => toggleVisitado(item.id)}
              />
              <Button title="Eliminar" color="#EF4444" onPress={() => eliminar(item.id)} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  title: { fontSize: 30, fontWeight: '800', color: '#0F172A' },
  subtitle: { color: '#64748B', fontSize: 14, marginBottom: 16, marginTop: 4 },
  error: { color: '#EF4444', marginBottom: 12, fontWeight: '600' },
  formCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#1E293B' },
  input: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 15 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pill: { backgroundColor: '#E2E8F0', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  pillActive: { backgroundColor: '#0284C7' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  pillTextActive: { color: '#FFFFFF' },
  list: { paddingBottom: 24 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  destinationTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },
  badgeVisitado: { fontSize: 13, fontWeight: '700', color: '#16A34A', backgroundColor: '#DCFCE7', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  badgePendiente: { fontSize: 13, fontWeight: '700', color: '#D97706', backgroundColor: '#FEF3C7', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  descriptionText: { color: '#475569', fontSize: 14, marginBottom: 12, lineHeight: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 20, fontStyle: 'italic' },
});
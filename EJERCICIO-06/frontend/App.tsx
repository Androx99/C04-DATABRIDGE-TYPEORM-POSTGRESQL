import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type Libro = {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  leido: boolean;
};

const API_URL = 'http://192.168.1.133:3000';

export default function App() {
  const [libros, setLibros] = useState<Libro[]>([]);

  async function cargar() {
    try {
      const r = await fetch(API_URL + '/libros');
      setLibros(await r.json());
    } catch {
      // Manejo de error de conexión opcional
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function marcarLeido(id: number) {
    try {
      await fetch(API_URL + '/libros/' + id, { method: 'PATCH' });
      await cargar();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado del libro en el servidor.');
    }
  }

  function confirmar(libro: Libro) {
    Alert.alert('Eliminar libro', libro.titulo, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(libro.id) },
    ]);
  }

  async function eliminar(id: number) {
    try {
      await fetch(API_URL + '/libros/' + id, { method: 'DELETE' });
      setLibros((actuales) => actuales.filter((l) => l.id !== id));
    } catch {
      Alert.alert('Error', 'No se pudo eliminar el libro.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📚 My Library</Text>
      <FlatList
        data={libros}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.bookTitle}>{item.titulo}</Text>
              <Text style={item.leido ? styles.badgeLeido : styles.badgePendiente}>
                {item.leido ? '✓ Leído' : '📖 Pendiente'}
              </Text>
            </View>
            <Text style={styles.subtitle}>{item.autor} · {item.genero}</Text>
            <View style={styles.actions}>
              <Button
                title={item.leido ? '✓ Leído' : 'Marcar como leído'}
                color={item.leido ? '#16A34A' : '#2563EB'}
                onPress={() => marcarLeido(item.id)}
              />
              <Button title="Eliminar" color="#EF4444" onPress={() => confirmar(item)} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 16 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginRight: 8 },
  subtitle: { color: '#64748B', marginTop: 4, marginBottom: 12 },
  badgeLeido: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  badgePendiente: { fontSize: 13, fontWeight: '700', color: '#D97706' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
});

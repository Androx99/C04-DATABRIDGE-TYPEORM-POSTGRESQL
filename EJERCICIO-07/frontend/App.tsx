import { useEffect, useState } from 'react';
import { Button, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type Sneaker = {
  id: number;
  marca: string;
  modelo: string;
  precio: number;
  talla: number;
  stock: number;
};

const API_URL = 'http://192.168.1.133:3000';

export default function App() {
  const [items, setItems] = useState<Sneaker[]>([]);
  const [error, setError] = useState('');

  async function request(url: string, options?: RequestInit) {
    const r = await fetch(url, options);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r;
  }

  async function cargar() {
    try {
      const r = await request(API_URL + '/sneakers');
      setItems(await r.json());
      setError('');
    } catch {
      setError('No se pudo conectar con la API.');
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear() {
    try {
      await request(API_URL + '/sneakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marca: 'Nike',
          modelo: 'Air Max 1',
          precio: 149.99,
          talla: 42,
          stock: 10,
        }),
      });
      await cargar();
    } catch {
      setError('Error al crear.');
    }
  }

  async function rebajar(id: number) {
    try {
      await request(API_URL + '/sneakers/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ precio: 139.99 }),
      });
      await cargar();
    } catch {
      setError('Error al actualizar.');
    }
  }

  async function cambiarStock(id: number, stockActual: number, delta: number) {
    const nuevoStock = Math.max(0, stockActual + delta);
    try {
      await request(API_URL + '/sneakers/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nuevoStock }),
      });
      await cargar();
    } catch {
      setError('Error al actualizar stock.');
    }
  }

  async function eliminar(id: number) {
    try {
      await request(API_URL + '/sneakers/' + id, { method: 'DELETE' });
      await cargar();
    } catch {
      setError('Error al eliminar.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>👟 Sneaker Vault</Text>
        <Button title="+ Nueva" onPress={crear} />
      </View>

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={items}
        keyExtractor={(x) => String(x.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.modelName}>{item.marca} {item.modelo}</Text>
              <Text style={styles.price}>{Number(item.precio).toFixed(2)} €</Text>
            </View>
            <Text style={styles.details}>Talla: {item.talla} · Stock: {item.stock}</Text>
            <View style={styles.actions}>
              <Button title="Rebajar" onPress={() => rebajar(item.id)} />
              <Button title="Eliminar" color="#EF4444" onPress={() => eliminar(item.id)} />
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.stockSection}>
            <Text style={styles.sectionTitle}>📦 Control de Stock</Text>
            {items.map((item) => (
              <View key={'stock-' + item.id} style={styles.stockCard}>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockModel}>{item.modelo}</Text>
                  <Text style={styles.stockBrand}>{item.marca}</Text>
                </View>
                <View style={styles.stockControls}>
                  <Text style={item.stock === 0 ? styles.badgeAgotado : styles.badgeStock}>
                    {item.stock === 0 ? 'AGOTADO' : `Stock: ${item.stock}`}
                  </Text>
                  <View style={styles.stockButtons}>
                    <Button
                      title="-1"
                      color="#EF4444"
                      disabled={item.stock <= 0}
                      onPress={() => cambiarStock(item.id, item.stock, -1)}
                    />
                    <Button
                      title="+1"
                      color="#16A34A"
                      onPress={() => cambiarStock(item.id, item.stock, 1)}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  error: { color: '#EF4444', marginBottom: 12, fontWeight: '600' },
  list: { paddingBottom: 24 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modelName: { fontSize: 18, fontWeight: '700', flex: 1 },
  price: { fontSize: 16, fontWeight: '700', color: '#0F766E' },
  details: { color: '#64748B', marginTop: 4, marginBottom: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  stockSection: { marginTop: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12, color: '#334155' },
  stockCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockInfo: { flex: 1 },
  stockModel: { fontSize: 16, fontWeight: '700' },
  stockBrand: { color: '#64748B', fontSize: 14 },
  stockControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stockButtons: { flexDirection: 'row', gap: 6 },
  badgeAgotado: { fontSize: 13, fontWeight: '800', color: '#EF4444' },
  badgeStock: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
});

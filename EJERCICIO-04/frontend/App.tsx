// App.tsx — formulario POST
import { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

type Restaurante = {
  id?: number;
  nombre: string;
  tipo: string;
  ciudad: string;
  puntuacion: number;
  precioMedio: number;
};

const API_URL = 'http://172.22.28.53:3000';

export default function App() {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [precioMedio, setPrecioMedio] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardado, setGuardado] = useState<Restaurante | null>(null);

  async function guardar() {
    try {
      const respuesta = await fetch(API_URL + '/restaurantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          tipo,
          ciudad,
          puntuacion: 9,
          precioMedio: Number(precioMedio) || 0,
        }),
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setGuardado(datos);
        setMensaje('Restaurante guardado ✓');
      } else {
        setMensaje('Error al guardar');
      }
    } catch {
      setMensaje('Error de conexión');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🍜 Food Spots</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Tipo"
        value={tipo}
        onChangeText={setTipo}
      />
      <TextInput
        style={styles.input}
        placeholder="Ciudad"
        value={ciudad}
        onChangeText={setCiudad}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio medio (€)"
        value={precioMedio}
        keyboardType="numeric"
        onChangeText={setPrecioMedio}
      />
      <Button title="Guardar restaurante" onPress={guardar} />
      <Text style={styles.mensaje}>{mensaje}</Text>

      {guardado && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{guardado.nombre}</Text>
          <Text style={styles.cardText}>{guardado.tipo} · {guardado.ciudad}</Text>
          <Text style={styles.cardText}>⭐ {Number(guardado.puntuacion).toFixed(1)}</Text>
          <Text style={styles.cardText}>💶 Precio medio: {Number(guardado.precioMedio).toFixed(2)} €</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FFF7ED' },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 20 },
  input: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 12 },
  mensaje: { marginVertical: 12, fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginTop: 16 },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  cardText: { fontSize: 15, color: '#4B5563', marginBottom: 4 },
});
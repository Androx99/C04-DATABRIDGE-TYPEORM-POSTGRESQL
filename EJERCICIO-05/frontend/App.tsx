import { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, TextInput } from 'react-native';

const API_URL = 'http://172.22.28.53:3000';

export default function App() {
  const [estado, setEstado] = useState('RESERVADO');
  const [fecha, setFecha] = useState('2027-04-10');
  const [mensaje, setMensaje] = useState('');

  async function actualizar() {
    const r = await fetch(API_URL + '/viajes/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, fecha }),
    });
    setMensaje(r.ok ? 'Viaje actualizado ✓' : 'No se pudo actualizar');
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>✈️ Travel Book</Text>
      <TextInput
        style={styles.input}
        value={estado}
        onChangeText={setEstado}
        placeholder="Estado"
      />
      <TextInput
        style={styles.input}
        value={fecha}
        onChangeText={setFecha}
        placeholder="Fecha"
      />
      <Button title="Guardar cambios" onPress={actualizar} />
      <Text>{mensaje}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 30, fontWeight: '800' },
  input: { padding: 14, backgroundColor: '#F1F5F9', marginVertical: 8 },
});

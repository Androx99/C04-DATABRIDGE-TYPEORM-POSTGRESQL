// App.tsx
// RESPONSABILIDAD: solicitar una mascota concreta y mostrar su ficha.
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

type Mascota = {
  id: number;
  nombre: string;
  raza: string;
  edad: number;
  ciudad: string;
  nivelEnergia: string;
};

const API_URL = 'http://172.22.28.53:3000';

export default function App() {
  const [mascota, setMascota] = useState<Mascota | null>(null);

  useEffect(() => {
    // En este ejemplo pedimos la mascota con id 1.
    fetch(API_URL + '/mascotas/1')
      .then((r) => r.json())
      .then((dato: Mascota) => setMascota(dato));
  }, []);

  if (!mascota) return <Text>Cargando...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🐶</Text>
        <Text style={styles.title}>{mascota.nombre}</Text>
        <Text>{mascota.raza}</Text>
        <Text>{mascota.edad} años · {mascota.ciudad}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.emoji}>⚡</Text>
        <Text style={styles.title}>Nivel de Energía: {mascota.nivelEnergia}</Text>
      </View>
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({
 container:{flex:1,justifyContent:'center',padding:24,backgroundColor:'#EEF6FF'},
 card:{backgroundColor:'#FFF',padding:28,borderRadius:24,alignItems:'center'},
 emoji:{fontSize:56},title:{fontSize:28,fontWeight:'800'}
});

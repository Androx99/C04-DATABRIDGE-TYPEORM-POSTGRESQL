// App.tsx
// RESPONSABILIDAD: mostrar canciones ordenadas por playlist y permitir añadir nuevas canciones a playlists concretas.
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Cancion = {
  id: number;
  titulo: string;
  artista: string;
};

type Playlist = {
  id: number;
  nombre: string;
  canciones: Cancion[];
};

const API_URL = 'http://192.168.1.133:3000';

export default function App() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados del formulario para nueva canción
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

  async function cargar() {
    try {
      const r = await fetch(API_URL + '/playlists');
      if (!r.ok) throw new Error('Error al obtener playlists');
      const datos: Playlist[] = await r.json();
      setPlaylists(datos);
      if (datos.length > 0 && selectedPlaylistId === null) {
        setSelectedPlaylistId(datos[0].id);
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con la API de playlists.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function agregarCancion() {
    if (!titulo.trim() || !artista.trim()) {
      Alert.alert('Campos incompletos', 'Escribe el título y el artista de la canción.');
      return;
    }
    if (!selectedPlaylistId) {
      Alert.alert('Selecciona una playlist', 'Elige a qué playlist quieres añadir la canción.');
      return;
    }

    try {
      const r = await fetch(API_URL + '/playlists/' + selectedPlaylistId + '/canciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          artista: artista.trim(),
        }),
      });

      if (!r.ok) throw new Error('Error al guardar la canción');

      setTitulo('');
      setArtista('');
      await cargar();
    } catch {
      Alert.alert('Error', 'No se pudo añadir la canción a la playlist.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.mainTitle}>🎵 Mis Playlists</Text>
      <Text style={styles.subtitle}>Canciones organizadas por playlist en PostgreSQL</Text>

      {/* Formulario para añadir canción a una playlist concreta */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>➕ Nueva canción</Text>

        <TextInput
          style={styles.input}
          placeholder="Título de la canción"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={styles.input}
          placeholder="Artista"
          value={artista}
          onChangeText={setArtista}
        />

        <Text style={styles.labelPlaylist}>Selecciona la playlist de destino:</Text>
        <View style={styles.playlistSelector}>
          {playlists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.id;
            return (
              <TouchableOpacity
                key={pl.id}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => setSelectedPlaylistId(pl.id)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {pl.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button title="Añadir a playlist" onPress={agregarCancion} />
      </View>

      {cargando ? (
        <Text style={styles.cargandoText}>Cargando canciones...</Text>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.playlistCard}>
              <View style={styles.playlistHeader}>
                <Text style={styles.playlistName}>📁 {item.nombre}</Text>
                <Text style={styles.songCount}>
                  {item.canciones?.length ?? 0} {item.canciones?.length === 1 ? 'canción' : 'canciones'}
                </Text>
              </View>

              {item.canciones && item.canciones.length > 0 ? (
                item.canciones.map((cancion, idx) => (
                  <View key={cancion.id} style={[styles.songRow, idx > 0 && styles.songBorder]}>
                    <Text style={styles.songTitle}>🎵 {cancion.titulo}</Text>
                    <Text style={styles.songArtist}>{cancion.artista}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyPlaylist}>No hay canciones en esta playlist.</Text>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  subtitle: { color: '#64748B', fontSize: 14, marginBottom: 16, marginTop: 4 },
  formCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#334155' },
  input: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 15 },
  labelPlaylist: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 8, fontWeight: '600' },
  playlistSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#E2E8F0' },
  pillSelected: { backgroundColor: '#2563EB' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  pillTextSelected: { color: '#FFFFFF' },
  list: { paddingBottom: 24 },
  playlistCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  playlistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
  playlistName: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  songCount: { fontSize: 13, fontWeight: '600', color: '#64748B', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  songRow: { paddingVertical: 8 },
  songBorder: { borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  songTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  songArtist: { fontSize: 14, color: '#64748B', marginTop: 2, marginLeft: 22 },
  emptyPlaylist: { color: '#94A3B8', fontStyle: 'italic', marginVertical: 8 },
  cargandoText: { textAlign: 'center', marginTop: 30, color: '#64748B' },
});

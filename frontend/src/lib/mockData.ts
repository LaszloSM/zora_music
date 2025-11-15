// Mock data for development and testing
import type { Song, Playlist, User } from '../types';

export const mockSongs: Song[] = [
  {
    id: 1,
    titulo: 'Summer Nights',
    artista_nombre: 'DJ Wave',
    artista_id: 1,
    duracion: 240,
    archivo_audio: '/media/canciones/summer-nights.mp3',
    imagen_portada: '/media/portadas/summer-nights.jpg',
    plays: 1250,
    fecha_subida: '2024-01-15',
  },
  {
    id: 2,
    titulo: 'Electric Dreams',
    artista_nombre: 'Neon City',
    artista_id: 2,
    duracion: 195,
    archivo_audio: '/media/canciones/electric-dreams.mp3',
    imagen_portada: '/media/portadas/electric-dreams.jpg',
    plays: 890,
    fecha_subida: '2024-02-20',
  },
  {
    id: 3,
    titulo: 'Midnight Drive',
    artista_nombre: 'RetroWave',
    artista_id: 3,
    duracion: 210,
    archivo_audio: '/media/canciones/midnight-drive.mp3',
    imagen_portada: '/media/portadas/midnight-drive.jpg',
    plays: 2100,
    fecha_subida: '2024-03-10',
  },
];

export const mockPlaylists: Playlist[] = [
  {
    id: 1,
    nombre: 'Chill Vibes',
    descripcion: 'Relaxing tunes for work and study',
    usuario_id: 1,
    usuario_nombre: 'user1',
    fecha_creacion: '2024-01-01',
    canciones: mockSongs.slice(0, 2),
  },
  {
    id: 2,
    nombre: 'Workout Energy',
    descripcion: 'High energy tracks for your workout',
    usuario_id: 1,
    usuario_nombre: 'user1',
    fecha_creacion: '2024-02-01',
    canciones: [mockSongs[2]],
  },
];

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'testuser',
    email: 'user@test.com',
    nombres: 'Test',
    apellidos: 'User',
    rol: 'usuario',
  },
  {
    id: 2,
    username: 'testartist',
    email: 'artist@test.com',
    nombres: 'Test',
    apellidos: 'Artist',
    rol: 'artista',
  },
  {
    id: 3,
    username: 'admin',
    email: 'admin@test.com',
    nombres: 'Admin',
    apellidos: 'User',
    rol: 'admin',
  },
];

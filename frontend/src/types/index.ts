export interface User {
  id: string;
  email: string;
  nombres?: string;
  apellidos?: string;
  nombre_artistico?: string;
  name?: string;
  username?: string;
  role: 'listener' | 'artist' | 'admin';
  avatar?: string;
  createdAt?: Date;
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string | null;
  albumName: string | null;
  duration: number; // en segundos
  genre: string;
  coverUrl: string;
  audioUrl: string;
  plays: number;
  createdAt: Date;
  isFavorite?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  year: number;
  genre: string;
  songs: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  userId: string;
  coverUrl: string;
  songs: Song[];
  isPublic: boolean;
  createdAt: Date;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  genres: string[];
  followers: number;
}

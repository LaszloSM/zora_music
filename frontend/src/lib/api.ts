import { User, Song, Playlist, Artist } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();
    const hasBody = rawText && rawText.length > 0;
    const parseJSON = (text: string) => {
      try { return JSON.parse(text); } catch { return null; }
    };
    let data: any = hasBody && contentType.includes('application/json') ? parseJSON(rawText) : null;

    // Utilidad para limpiar mensajes del formato DRF ErrorDetail
    const cleanDRFMessage = (msg: unknown): string => {
      if (msg == null) return '';
      if (typeof msg === 'string') {
        // Reemplazar "ErrorDetail(string='...', code='...')" por el texto interno
        const cleaned = msg.replace(/ErrorDetail\(string='([^']+)'(?:, code='[^']*')?\)/g, '$1')
                           .replace(/^\[|\]$/g, '')
                           .trim();
        return cleaned;
      }
      if (Array.isArray(msg)) {
        return msg.map(cleanDRFMessage).filter(Boolean).join(', ');
      }
      if (typeof msg === 'object') {
        // Algunos backends envían {message: '...'}
        const maybe = (msg as any).message || (msg as any).detail || '';
        return typeof maybe === 'string' ? maybe : JSON.stringify(msg);
      }
      return String(msg);
    };

    if (!response.ok) {
      const code = data?.code;
      if (response.status === 401 && code === 'token_not_valid') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshResponse.ok) {
            const tokens = await refreshResponse.json();
            localStorage.setItem('accessToken', tokens.access);
            
            requestOptions.headers = {
              ...requestOptions.headers,
              'Authorization': `Bearer ${tokens.access}`,
            } as Record<string, string>;
            const retry = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
            const retryCT = retry.headers.get('content-type') || '';
            const retryText = await retry.text();
            const retryHasBody = retryText && retryText.length > 0;
            return retryHasBody && retryCT.includes('application/json') ? parseJSON(retryText) : null;
          }
        }
      }
      const prettyField = (f: string) => ({
        email: 'Email',
        username: 'Nombre de usuario',
        nombres: 'Nombres',
        apellidos: 'Apellidos',
        nombre_artistico: 'Nombre artístico',
        non_field_errors: 'Error',
      } as Record<string, string>)[f] || f;

      let message = cleanDRFMessage(data?.detail) || `${response.status} ${response.statusText}`;

      // Si detail viene como cadena tipo "{'email': '...'}" convertirla a mensaje legible
      if (typeof message === 'string' && message.startsWith('{') && message.endsWith('}') && message.includes("'")) {
        try {
          const jsonLike = message.replace(/'\s*:\s*'/g, '":"').replace(/'/g, '"');
          const parsed = JSON.parse(jsonLike);
          const parts: string[] = [];
          Object.entries(parsed).forEach(([field, val]) => {
            const text = cleanDRFMessage(val as any);
            if (text) parts.push(`${prettyField(field)}: ${text}`);
          });
          if (parts.length) message = parts.join(' • ');
        } catch { /* ignore parse failure */ }
      }
      // Extraer mensajes de validación de campos si existen
      if (!data?.detail && data && typeof data === 'object') {
        try {
          const parts: string[] = [];
          Object.entries(data as Record<string, any>).forEach(([field, val]) => {
            const text = cleanDRFMessage(val);
            if (text) parts.push(`${prettyField(field)}: ${text}`);
          });
          if (parts.length) message = parts.join(' • ');
        } catch { /* ignore */ }
      }
      throw new Error(message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('Error en fetchAPI:', error);
    throw error instanceof Error ? error : new Error('Error en la petición');
  }
}

export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User }> => {
    // Importar dinámicamente el store para evitar dependencias circulares
    const { useAuthStore } = await import('../stores/auth');
    const authStore = useAuthStore.getState();
    
    // Llamar al método login del store que maneja todo
    return await authStore.login(email, password);
  },

  register: async (data: {
    nombres: string;
    apellidos: string;
    nombre_artistico?: string;
    email: string;
    password: string;
    role: 'listener' | 'artist';
    telefono?: string;
    fecha_nacimiento?: string;
    direccion?: string;
  }): Promise<{ user: User }> => {
    // Importar dinámicamente el store
    const { useAuthStore } = await import('../stores/auth');
    const authStore = useAuthStore.getState();
    
    // Llamar al método register del store
    await authStore.register(data);
    
    // Retornar el usuario actualizado
    return { user: authStore.user! };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    await fetchAPI('/auth/logout/', { method: 'POST' });
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await fetchAPI('/auth/profile/');
    return response.user;
  },
};

export const songsAPI = {
  mapBackendSong: (cancion: any): Song => ({
    id: cancion.id.toString(),
    title: cancion.title,
    artistId: cancion.artista?.id?.toString() || '',
    artistName: cancion.artista?.nombre_completo || cancion.artista?.email || 'Desconocido',
    albumId: cancion.album?.id?.toString() ?? null,
    albumName: cancion.album?.title ?? 'Single',
    duration: typeof cancion.duration === 'number' ? cancion.duration : 0,
    genre: cancion.genre?.name || 'Varios',
    coverUrl: cancion.cover_url || cancion.album?.cover_url || 'https://via.placeholder.com/300',
    audioUrl: cancion.audio_url || '',
    plays: cancion.play_count || 0,
    createdAt: new Date(cancion.created_at),
    isFavorite: cancion.is_favorite || false,
  }),

  getAll: async (): Promise<Song[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener canciones');
    }
    
    const data = await response.json();
    return data.map(songsAPI.mapBackendSong);
  },

  getById: async (id: string): Promise<Song> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/${id}/`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener canción');
    }
    
    const cancion = await response.json();
    
    return songsAPI.mapBackendSong(cancion);
  },

  search: async (query: string): Promise<Song[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/buscar/?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al buscar canciones');
    }
    
    const data = await response.json();
    
    return data.map(songsAPI.mapBackendSong);
  },

  upload: async (formData: FormData): Promise<Song> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al subir canción');
    }
    
    const cancion = await response.json();
    return songsAPI.mapBackendSong(cancion);
  },

  update: async (id: string, formData: FormData): Promise<Song> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al actualizar canción');
    }
    
    const cancion = await response.json();
    return songsAPI.mapBackendSong(cancion);
  },

  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al eliminar canción');
    }
  },
};

export const genresAPI = {
  getAll: async (): Promise<{ id: number; name: string }[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/generos/`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener géneros');
    }
    
    return await response.json();
  },
};

export const favoritesAPI = {
  getAll: async (): Promise<Song[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/favoritos/`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener favoritos');
    }
    
    const data = await response.json();
    
    return data.map((cancion: any) => ({
      ...songsAPI.mapBackendSong(cancion),
      isFavorite: true,
    }));
  },

  add: async (songId: string): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/favoritos/${songId}/agregar/`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al agregar favorito');
    }
  },

  remove: async (songId: string): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/favoritos/${songId}/quitar/`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al quitar favorito');
    }
  },

  check: async (songId: string): Promise<boolean> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/favoritos/${songId}/`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.is_favorite;
  },
};

export const historyAPI = {
  getAll: async (): Promise<Song[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/musica/historial/`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener historial');
    }
    
    const data = await response.json();
    
    return data.map(songsAPI.mapBackendSong);
  },

  register: async (songId: string): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    await fetch(`${API_BASE_URL}/musica/historial/${songId}/registrar/`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    // No lanzar error si falla, es solo tracking
  },
};

export const playlistsAPI = {
  getAll: async (): Promise<Playlist[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/listas/`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener playlists');
    }
    
    const data = await response.json();
    
    // Transformar los datos del backend al formato del frontend
    return data.map((playlist: any) => ({
      id: playlist.id.toString(),
      name: playlist.name,
      description: playlist.description || playlist.name,
      userId: playlist.user.toString(),
      coverUrl: playlist.songs?.[0]?.cover_url || 'https://via.placeholder.com/300',
      songs: playlist.songs?.map((cancion: any) => songsAPI.mapBackendSong(cancion)) || [],
      isPublic: playlist.is_public,
      createdAt: new Date(playlist.created_at)
    }));
  },

  create: async (data: {
    name: string;
    description?: string;
    is_public?: boolean;
  }): Promise<Playlist> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/listas/`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        is_public: data.is_public || false,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al crear playlist');
    }
    
    const playlist = await response.json();
    
    return {
      id: playlist.id.toString(),
      name: playlist.name,
      description: playlist.description || playlist.name,
      userId: playlist.user.toString(),
      coverUrl: 'https://via.placeholder.com/300',
      songs: [],
      isPublic: playlist.is_public,
      createdAt: new Date(playlist.created_at)
    };
  },

  addSong: async (playlistId: string, songId: string): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/listas/${playlistId}/agregar-cancion/`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ song_id: songId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al agregar canción');
    }
  },

  removeSong: async (playlistId: string, songId: string): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/listas/${playlistId}/quitar-cancion/`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ song_id: songId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al remover canción');
    }
  },

  update: async (playlistId: string, data: {
    name?: string;
    description?: string;
    is_public?: boolean;
  }): Promise<Playlist> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/listas/${playlistId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al actualizar playlist');
    }
    
    const playlist = await response.json();
    
    return {
      id: playlist.id.toString(),
      name: playlist.name,
      description: playlist.description || playlist.name,
      userId: playlist.user.toString(),
      coverUrl: playlist.songs?.[0]?.cover_url || 'https://via.placeholder.com/300',
      songs: playlist.songs?.map((cancion: any) => songsAPI.mapBackendSong(cancion)) || [],
      isPublic: playlist.is_public,
      createdAt: new Date(playlist.created_at)
    };
  },

  delete: async (playlistId: string): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/listas/${playlistId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al eliminar playlist');
    }
  },
};

export const artistsAPI = {
  getAll: async (): Promise<Artist[]> => {
    const response = await fetchAPI('/artists/');
    return response;
  },
};

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await fetchAPI('/auth/usuarios/');
    return response;
  },

  create: async (data: {
    email: string;
    password: string;
    nombres?: string;
    apellidos?: string;
    nombre_artistico?: string;
    role: 'listener' | 'artist' | 'admin';
  }): Promise<User> => {
    const response = await fetchAPI('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // El endpoint de registro devuelve { access, refresh, user }
    return response.user;
  },

  update: async (
    id: string,
    data: Partial<User> & { rol?: number }
  ): Promise<User> => {
    const response = await fetchAPI(`/auth/usuarios/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response;
  },

  delete: async (id: string): Promise<void> => {
    await fetchAPI(`/auth/usuarios/${id}/`, {
      method: 'DELETE',
    });
  },

  search: async (query: string): Promise<User[]> => {
    const response = await fetchAPI(`/auth/usuarios/?search=${encodeURIComponent(query)}`);
    return response;
  },

  setPassword: async (id: string, newPassword: string): Promise<void> => {
    await fetchAPI(`/auth/usuarios/${id}/set-password/`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword }),
    });
  },
};

export const statsAPI = {
  getSongPlays: async (id: string): Promise<number> => {
    const response = await fetchAPI(`/musica/plays/${id}/`);
    return response?.play_count ?? 0;
  },
  getBulkSongPlays: async (ids: string[]): Promise<Record<string, number>> => {
    if (!ids.length) return {};
    const response = await fetchAPI(`/musica/plays/?ids=${ids.join(',')}`);
    const out: Record<string, number> = {};
    (response?.results || []).forEach((r: { id: number; play_count: number }) => {
      out[String(r.id)] = r.play_count || 0;
    });
    return out;
  },
  getArtistSummary: async (): Promise<{ total_reproducciones: number; canciones: { id: number; title: string; play_count: number }[] }> => {
    return await fetchAPI('/reportes/artista/resumen/');
  },
  getAdminSummary: async (): Promise<{ total_canciones: number; total_reproducciones: number; top: { id: number; title: string; play_count: number }[] }> => {
    return await fetchAPI('/reportes/admin/resumen-live/');
  },
};
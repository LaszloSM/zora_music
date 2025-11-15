import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

import { User } from '../types';

interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    username: string;
    email: string;
    nombres?: string;
    apellidos?: string;
    nombre_artistico?: string;
    role: string;
  };
}

interface AuthError {
  detail?: string;
  [key: string]: any;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    nombres: string;
    apellidos: string;
    nombre_artistico?: string;
    role: 'listener' | 'artist';
    telefono?: string;
    fecha_nacimiento?: string;
    direccion?: string;
    captcha_token?: string;
    recaptchaToken?: string;
  }) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: (() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Ensure ID is always a string
        if (parsed && parsed.id) {
          parsed.id = String(parsed.id);
        }
        return parsed;
      } catch (e) {
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  })(),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  error: null,

  login: async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/login/', { 
        email, 
        password 
      });
      
      const { access, refresh, user } = response.data;
      console.log('Datos recibidos del backend:', response.data);
      
      if (!user || !user.email) {
        throw new Error('Datos de usuario inválidos del servidor');
      }

      // Normaliza los datos del usuario exactamente como vienen del backend
      const normalizedUser: User = {
        id: String(user.id),
        email: user.email,
        username: user.username,
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        nombre_artistico: user.nombre_artistico || '',
        role: user.role?.toLowerCase() as 'listener' | 'artist' | 'admin',
        name: user.role?.toLowerCase() === 'artist' && user.nombre_artistico 
          ? user.nombre_artistico 
          : (user.username || user.email),
        createdAt: new Date()
      };
      
      console.log('Guardando datos en localStorage:', { normalizedUser, access });
      
      // Store auth data in localStorage
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      console.log('Datos guardados. Verificando localStorage:', {
        accessToken: localStorage.getItem('accessToken'),
        user: localStorage.getItem('user')
      });
      
      // Update store state
      set({
        user: normalizedUser,
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
        error: null,
      });

      return { user: normalizedUser };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout/');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/register/', userData);
      const { access, refresh, user } = response.data;
      
      console.log('Datos de registro recibidos:', response.data);
      
      // Normalizar usuario igual que en login
      const normalizedUser: User = {
        id: String(user.id),
        email: user.email,
        username: user.username,
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        nombre_artistico: user.nombre_artistico || '',
        role: user.role?.toLowerCase() as 'listener' | 'artist' | 'admin',
        name: user.role?.toLowerCase() === 'artist' && user.nombre_artistico 
          ? user.nombre_artistico 
          : (user.username || user.email),
        createdAt: new Date()
      };
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      set({
        user: normalizedUser,
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
        error: null,
      });
    } catch (error: any) {
      console.error('Error en registro:', error.response?.data || error);
      const errorData = error.response?.data as AuthError;
      const errorMessage = errorData?.detail || 
        Object.entries(errorData || {})
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ') ||
        'Error al registrar';
      
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));
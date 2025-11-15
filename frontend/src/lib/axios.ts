import axios from 'axios';

const baseURL = 'http://localhost:8000/api';

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para manejar el token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Asegurarnos de que las credenciales se envíen siempre
  config.withCredentials = true;
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar la respuesta y errores
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 y no hemos intentado refresh aún, intentamos renovar el token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${baseURL}/auth/token/refresh/`, {
          refresh: refreshToken
        }, {
          withCredentials: true // Importante para las cookies
        });

        const { access } = response.data;
        if (!access) {
          return Promise.reject(new Error('No se recibió el token de acceso'));
        }

        // Guardamos nuevo access token
        localStorage.setItem('accessToken', access);

        // Reintentamos la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        // Solo limpiamos tokens si el refresh realmente falló
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);
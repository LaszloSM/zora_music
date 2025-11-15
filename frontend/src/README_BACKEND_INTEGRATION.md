# Integración Frontend-Backend

## Configuración de API

El frontend se comunica con el backend Django REST Framework a través de Axios.

### Base URL
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

## Endpoints Disponibles

### Autenticación
- `POST /api/auth/register/` - Registrar usuario
- `POST /api/auth/login/` - Login
- `POST /api/auth/token/refresh/` - Refrescar token
- `GET /api/auth/me/` - Obtener usuario actual

### Música
- `GET /api/musica/canciones/` - Lista de canciones
- `GET /api/musica/canciones/:id/` - Detalle de canción
- `POST /api/musica/canciones/:id/incrementar_plays/` - Registrar reproducción
- `POST /api/musica/canciones/` - Subir canción (artista)
- `PUT /api/musica/canciones/:id/` - Actualizar canción (artista)
- `DELETE /api/musica/canciones/:id/` - Eliminar canción (artista)

### Playlists
- `GET /api/playlists/` - Lista de playlists del usuario
- `POST /api/playlists/` - Crear playlist
- `GET /api/playlists/:id/` - Detalle de playlist
- `PUT /api/playlists/:id/` - Actualizar playlist
- `DELETE /api/playlists/:id/` - Eliminar playlist
- `POST /api/playlists/:id/agregar_cancion/` - Agregar canción
- `DELETE /api/playlists/:id/quitar_cancion/` - Quitar canción

### Estadísticas
- `GET /api/reports/artist-summary/` - Resumen artista
- `POST /api/reports/bulk-song-plays/` - Reproducciones múltiples canciones
- `GET /api/reports/admin-summary/` - Resumen admin

### Admin
- `GET /api/admin/users/` - Lista usuarios
- `POST /api/admin/users/` - Crear usuario
- `PUT /api/admin/users/:id/` - Actualizar usuario
- `DELETE /api/admin/users/:id/` - Eliminar usuario

## Autenticación

### JWT Tokens
El backend usa JWT para autenticación:
```typescript
{
  access: string;  // Token de acceso (5 min)
  refresh: string; // Token de refresco (1 día)
}
```

### Headers
```typescript
Authorization: Bearer ${accessToken}
```

### Refresh Automático
El interceptor de Axios refresca automáticamente tokens expirados:
```typescript
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Intentar refrescar token
      const newToken = await refreshToken();
      // Reintentar request original
    }
  }
);
```

## Tipos de Usuario

```typescript
type Role = 'usuario' | 'artista' | 'admin';
```

### Permisos
- **usuario**: Ver, reproducir, crear playlists
- **artista**: Todo de usuario + subir/editar canciones + ver estadísticas
- **admin**: Acceso completo + gestionar usuarios

## Formato de Datos

### Song (Canción)
```typescript
{
  id: number;
  titulo: string;
  artista_nombre: string;
  artista_id: number;
  duracion: number; // segundos
  archivo_audio: string; // URL
  imagen_portada?: string | null; // URL
  plays: number;
  fecha_subida: string; // ISO date
}
```

### Playlist
```typescript
{
  id: number;
  nombre: string;
  descripcion?: string;
  usuario_id: number;
  usuario_nombre?: string;
  fecha_creacion: string; // ISO date
  canciones?: Song[];
  imagen_portada?: string | null;
}
```

### User
```typescript
{
  id: number;
  username: string;
  email: string;
  nombres?: string;
  apellidos?: string;
  rol: 'usuario' | 'artista' | 'admin';
}
```

## Manejo de Errores

### Formato de Error DRF
```typescript
{
  detail: string | { [key: string]: string[] }
}
```

### Helper de Limpieza
```typescript
function cleanErrorMessage(error: any): string {
  // Extrae mensajes legibles de errores DRF
  // Maneja ErrorDetail, arrays, objetos
}
```

## CORS

El backend debe permitir:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

## Archivos Estáticos

### Desarrollo
Django sirve archivos media en `/media/`

### Producción
Configurar servidor web (Nginx/Apache) para servir:
- `/media/canciones/` - Archivos de audio
- `/media/portadas/` - Imágenes de portada

## Testing

### Variables de Entorno
```bash
# .env.development
VITE_API_URL=http://localhost:8000

# .env.production
VITE_API_URL=https://api.zoramusic.com
```

### Mock Data
Para desarrollo sin backend:
```typescript
import { mockSongs } from './lib/mockData';
```

## Troubleshooting

### CORS Errors
- Verifica `CORS_ALLOWED_ORIGINS` en Django
- Asegúrate de incluir `http://` o `https://`

### 401 Unauthorized
- Token expirado o inválido
- Verifica que el header Authorization esté presente
- Revisa tiempo de expiración en Django

### 403 Forbidden
- Usuario no tiene permisos
- Verifica rol del usuario
- Revisa permisos en Django views

### Media Files 404
- Verifica `MEDIA_URL` y `MEDIA_ROOT` en Django
- Asegúrate de servir archivos media en desarrollo
- En producción, configura servidor web

## Deployment

### Build
```bash
npm run build
```

### Environment
```env
VITE_API_URL=https://api.production.com
VITE_RECAPTCHA_SITE_KEY=production_key
```

### Serve
Archivos estáticos en `dist/` listos para servir con:
- Vercel
- Netlify
- GitHub Pages
- Nginx
- Apache

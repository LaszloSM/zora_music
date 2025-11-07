# Zora - Plataforma de Música en Streaming

## Requisitos Previos

- Python 3.8 o superior
- Node.js 18 o superior
- npm o yarn

## Archivos de Dependencias

- **Backend**: `backend/requirements.txt` - Dependencias de Python/Django
- **Frontend**: `frontend/package.json` - Dependencias de Node.js/React

## Instalación

### Backend (Django)

1. Navega a la carpeta del backend:
```bash
cd backend
```

2. Crea un entorno virtual (recomendado):
```bash
python -m venv venv
```

3. Activa el entorno virtual:
   - Windows:
   ```bash
   venv\Scripts\activate
   ```
   - Linux/Mac:
   ```bash
   source venv/bin/activate
   ```

4. Instala las dependencias:
```bash
pip install -r requirements.txt
```

5. Realiza las migraciones de la base de datos:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. (Opcional) Crea un superusuario:
```bash
python manage.py createsuperuser
```

7. Inicia el servidor de desarrollo:
```bash
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### Frontend (React + Vite)

1. Navega a la carpeta del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## Estructura del Proyecto

```
Zora/
├── backend/          # Aplicación Django
│   ├── apps/        # Módulos de la aplicación
│   ├── backend/     # Configuración principal
│   ├── db.sqlite3   # Base de datos SQLite
│   ├── manage.py    # Script de gestión de Django
│   └── requirements.txt
│
└── frontend/        # Aplicación React
    ├── src/         # Código fuente
    ├── public/      # Archivos públicos
    ├── package.json
    └── vite.config.ts
```

## Configuración

### Backend

- El archivo de configuración principal está en `backend/backend/settings.py`
- CORS está configurado para permitir `http://localhost:5173`
- La base de datos por defecto es SQLite

### Frontend

- La URL base del API está configurada en `frontend/src/lib/axios.ts`
- Por defecto apunta a `http://localhost:8000/api`

## Roles de Usuario

La aplicación soporta tres tipos de roles:

1. **Oyente**: Usuario estándar que puede escuchar música y crear playlists
2. **Artista**: Puede subir y gestionar su propia música
3. **Administrador**: Acceso completo al sistema

## Credenciales de Prueba

Después de crear un superusuario, puedes acceder al panel de administración de Django en:
`http://localhost:8000/admin`

## Comandos Útiles

### Backend

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar tests
python manage.py test

# Iniciar servidor
python manage.py runserver
```

### Frontend

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## Solución de Problemas

### El backend no inicia
- Verifica que el entorno virtual esté activado
- Asegúrate de haber instalado todas las dependencias: `pip install -r requirements.txt`
- Verifica que las migraciones estén aplicadas: `python manage.py migrate`

### El frontend no inicia
- Elimina la carpeta `node_modules` y ejecuta `npm install` de nuevo
- Verifica que Node.js esté instalado: `node --version`
- Verifica que el puerto 5173 no esté en uso

### Errores de CORS
- Asegúrate de que el frontend esté corriendo en `http://localhost:5173`
- Verifica la configuración de CORS en `backend/backend/settings.py`

### La sesión se cierra al recargar
- Verifica que el navegador permita cookies
- Abre la consola del navegador (F12) y revisa la pestaña de Application/Storage
- Asegúrate de que localStorage tenga los tokens guardados

## Licencia

Este proyecto es privado y confidencial.

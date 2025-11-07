from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):

    ADMIN_NAMES = ['administrador', 'admin']

    def has_permission(self, request, view):
        user = request.user
        # Verifica el campo rol directamente en el usuario
        if hasattr(user, 'rol') and user.rol and hasattr(user.rol, 'nombre'):
            return user.rol.nombre.lower() in self.ADMIN_NAMES
        return False

class IsUserRole(BasePermission):

    USER_NAMES = ['Usuario', 'usuario', 'user', 'User']
    
    def has_permission(self, request, view):
        user = request.user
        perfil = getattr(user, 'perfil', None)
        if perfil and perfil.rol and perfil.rol.nombre:
            return perfil.rol.nombre.lower() in self.USER_NAMES
        return False


class IsArtistaOrAdmin(BasePermission):
    """Permiso que permite lectura a cualquiera (GET/HEAD/OPTIONS),
    pero requiere que el usuario tenga rol 'artista' o 'administrador' para métodos no seguros.
    """

    ARTIST_NAMES = ['artista', 'artist']
    ADMIN_NAMES = ['administrador', 'admin']

    def has_permission(self, request, view):
        # permitir siempre métodos seguros
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        user = request.user
        if not user or not getattr(user, 'is_authenticated', False):
            return False

        # intentamos leer rol de forma robusta
        rol_nombre = ''
        if hasattr(user, 'rol') and user.rol and getattr(user.rol, 'nombre', None):
            rol_nombre = user.rol.nombre.lower()
        else:
            # fallback: algunos modelos usan perfil.rol
            perfil = getattr(user, 'perfil', None)
            if perfil and getattr(perfil, 'rol', None) and getattr(perfil.rol, 'nombre', None):
                rol_nombre = perfil.rol.nombre.lower()

        return rol_nombre in self.ARTIST_NAMES or rol_nombre in self.ADMIN_NAMES

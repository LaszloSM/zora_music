from django.contrib.auth.hashers import check_password
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Usuario, Rol, UsuarioRol
from .serializers import RegisterSerializer, UsuarioSerializer, RolSerializer, UsuarioRolSerializer
from .permissions import IsAdminRole
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .permissions import IsAdminRole

# CAMBIAR CONTRASEÑA DE USUARIO AUTENTICADO
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        if not current_password or not new_password:
            return Response({'detail': 'Debes proporcionar la contraseña actual y la nueva.'}, status=400)
        if not user.check_password(current_password):
            return Response({'detail': 'La contraseña actual es incorrecta.'}, status=400)
        if current_password == new_password:
            return Response({'detail': 'La nueva contraseña debe ser diferente a la actual.'}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Contraseña actualizada correctamente.'}, status=200)


# ENDPOINT DE PERFIL DE USUARIO AUTENTICADO
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            if not user or not user.is_authenticated:
                return Response({'detail': 'Usuario no autenticado'}, status=401)
            usuario = Usuario.objects.filter(username=user.username).first()
            if usuario:
                role_name = usuario.rol.nombre.lower() if usuario.rol and usuario.rol.nombre else "user"
                role = "admin" if role_name in ["admin", "administrador"] else "user"
                return Response({
                    'username': user.username,
                    'email': user.email,
                    'nombres': usuario.nombres,
                    'apellidos': usuario.apellidos,
                    'role': role,
                    'telefono': usuario.telefono,
                    'direccion': usuario.direccion,
                    'fecha_nacimiento': usuario.fecha_nacimiento,
                    'cedula': getattr(usuario, 'cedula', ''),
                    'emergencyContact': usuario.emergencyContact if hasattr(usuario, 'emergencyContact') else '',
                })
            else:
                return Response({'detail': f'No se encontró perfil para el usuario con id {user.id} y username {user.username}'}, status=404)
        except Exception as e:
            return Response({'detail': f'Error interno: {str(e)}'}, status=500)

    def put(self, request):
        try:
            user = request.user
            if not user or not user.is_authenticated:
                return Response({'detail': 'Usuario no autenticado'}, status=401)
            usuario = Usuario.objects.filter(username=user.username).first()
            if not usuario:
                return Response({'detail': 'No se encontró el usuario'}, status=404)
            data = request.data
            # Actualizar campos editables
            # Actualizar campos tanto en el objeto usuario como en el objeto user
            usuario.nombres = data.get('firstName', data.get('nombres', usuario.nombres))
            usuario.apellidos = data.get('lastName', data.get('apellidos', usuario.apellidos))
            user.first_name = usuario.nombres
            user.last_name = usuario.apellidos
            usuario.telefono = data.get('phone', data.get('telefono', usuario.telefono))
            usuario.direccion = data.get('address', data.get('direccion', usuario.direccion))
            birth_date = data.get('birthDate', data.get('fecha_nacimiento', None))
            if birth_date in [None, '', 'null']:
                usuario.fecha_nacimiento = None
            else:
                usuario.fecha_nacimiento = birth_date
            # Solo actualizar cedula si existe el atributo en el modelo
            if hasattr(usuario, 'cedula'):
                usuario.cedula = data.get('cedula', getattr(usuario, 'cedula', ''))
            if 'emergencyContact' in data and hasattr(usuario, 'emergencyContact'):
                usuario.emergencyContact = data['emergencyContact']
            if 'email' in data:
                user.email = data['email']
                usuario.email = data['email']
            user.save()
            usuario.save()
            role_name = usuario.rol.nombre.lower() if usuario.rol and usuario.rol.nombre else "user"
            role = "admin" if role_name in ["admin", "administrador"] else "user"
            return Response({
                'username': user.username,
                'email': user.email,
                'nombres': usuario.nombres,
                'apellidos': usuario.apellidos,
                'role': role,
                'telefono': usuario.telefono,
                'direccion': usuario.direccion,
                'fecha_nacimiento': usuario.fecha_nacimiento,
                'cedula': getattr(usuario, 'cedula', ''),
                'emergencyContact': usuario.emergencyContact if hasattr(usuario, 'emergencyContact') else '',
            })
        except Exception as e:
            return Response({'detail': f'Error interno: {str(e)}'}, status=500)

# REGISTRO DE USUARIOS
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    queryset = Usuario.objects.all()

    def create(self, request, *args, **kwargs):
        try:
            # Validar y crear usuario
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            # Generar token de acceso y refresco
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Ajustar tiempo de expiración (opcional)
            # access_token.set_exp(lifetime=timedelta(hours=1))

            response_data = {
                'refresh': str(refresh),
                'access': str(access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'nombres': user.nombres,
                    'apellidos': user.apellidos,
                    'role': 'listener'  # Por defecto todos son oyentes
                }
            }

            response = Response(response_data, status=status.HTTP_201_CREATED)

            # Configurar cookies HttpOnly para los tokens (opcional)
            response.set_cookie(
                'access_token',
                str(access_token),
                httponly=True,
                secure=True,
                samesite='Strict'
            )
            response.set_cookie(
                'refresh_token',
                str(refresh),
                httponly=True,
                secure=True,
                samesite='Strict'
            )

            return response

        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({'detail': f'Error interno: {str(e)}'}, status=500)

# VISTAS DE USUARIOS
class UsuarioListView(generics.ListAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = Usuario.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(nombres__icontains=search) |
                Q(apellidos__icontains=search)
            )
        return queryset

class UsuarioRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

# INICIAR SESION
class CookieLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        # Primero buscamos al usuario por email
        try:
            user_by_email = Usuario.objects.get(email=email)
            user = authenticate(username=user_by_email.username, password=password)
        except Usuario.DoesNotExist:
            return Response({"detail": "No existe un usuario con ese email"}, status=status.HTTP_401_UNAUTHORIZED)

        if user is None:
            return Response({"detail": "Contraseña incorrecta"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        if not user.rol:
            # Asignar rol 'Usuario' si no tiene
            rol_usuario, _ = Rol.objects.get_or_create(nombre="Usuario")
            user.rol = rol_usuario
            user.save()
        
        # Mapear los roles del backend a los roles del frontend
        role_mapping = {
            'Administrador': 'admin',
            'Artista': 'artist',
            'Oyente': 'listener'
        }
        
        role = role_mapping.get(user.rol.nombre, 'listener') if user.rol else 'listener'
        
        return Response({
            "access": access_token,
            "refresh": refresh_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "nombres": user.nombres,
                "apellidos": user.apellidos,
                "role": role,
            }
        })

# VERIFICACION DE AUTENTICACION
class HelloFromCookieView(APIView):
    def get(self, request):
        access_token = request.COOKIES.get('access_token')

        if not access_token:
            return Response({"detail": "No se encontró el token en cookies"}, status=401)
        
        jwt_authenticator = JWTAuthentication()
        try:
            validated_user, token = jwt_authenticator.authenticate(request._request)
        except Exception as e:
            return Response({"detail": f"Token inválido: {str(e)}"}, status=401)

        return Response({
            "message": f"Hola, {validated_user.username}, estas autenticado <3"
        })

# CERRAR SESION
class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Sesión cerrada correctamente."})
        
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        
        return response
    
# ROLES
class RolListCreateView(generics.ListCreateAPIView):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [permissions.IsAuthenticated]

class RolRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [permissions.IsAuthenticated]

class UsuarioRolCreateView(generics.CreateAPIView):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer
    permission_classes = [permissions.IsAuthenticated]
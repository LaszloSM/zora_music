from rest_framework import serializers
from .models import Usuario, Rol, UsuarioRol

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'nivel', 'default']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=['listener', 'artist', 'admin'], 
        default='listener',
        write_only=True
    )
    nombre_artistico = serializers.CharField(required=False, allow_blank=True)
    telefono = serializers.CharField(required=False, allow_blank=True)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    direccion = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'nombres', 'apellidos', 'nombre_artistico', 'role', 'telefono', 'fecha_nacimiento', 'direccion']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False},
        }

    def create(self, validated_data):
        try:
            # Validaciones de unicidad amigables
            email = validated_data.get('email', '').strip().lower()
            if not email:
                raise serializers.ValidationError({'email': 'El correo es obligatorio.'})
            if Usuario.objects.filter(email__iexact=email).exists():
                raise serializers.ValidationError({'email': 'Ya existe un usuario con ese correo.'})

            # Extraer la contraseña y el rol del diccionario
            password = validated_data.pop('password')
            role_frontend = validated_data.pop('role', 'listener')

            # Mapear el rol del frontend al backend
            role_mapping = {
                'listener': 'Oyente',
                'artist': 'Artista',
                'admin': 'Administrador'
            }
            rol_nombre = role_mapping.get(role_frontend, 'Oyente')
            
            # Si no se proporcionó username, generarlo
            if 'username' not in validated_data or not validated_data.get('username'):
                # Para artistas, usar nombre artístico directamente (con espacios y todo)
                if role_frontend == 'artist' and validated_data.get('nombre_artistico'):
                    base_username = validated_data['nombre_artistico']
                else:
                    # Para oyentes, usar email sin espacios
                    base_username = validated_data['email'].split('@')[0]
                
                # Asegurar que el username sea único
                username = base_username
                counter = 1
                while Usuario.objects.filter(username=username).exists():
                    if role_frontend == 'artist':
                        # Para artistas, agregar número al final
                        username = f"{base_username} {counter}"
                    else:
                        # Para oyentes, agregar número pegado
                        username = f"{base_username}{counter}"
                    counter += 1
                validated_data['username'] = username
            else:
                # Si viene username, validar unicidad amigable
                username = validated_data['username']
                if Usuario.objects.filter(username=username).exists():
                    raise serializers.ValidationError({'username': 'Ya existe un usuario con ese nombre de usuario.'})

            # Crear el usuario
            user = Usuario.objects.create(**validated_data)
            user.set_password(password)

            # Crear los roles por defecto si no existen
            roles_default = {
                'Administrador': {'nivel': 3, 'default': False},
                'Artista': {'nivel': 2, 'default': False},
                'Oyente': {'nivel': 1, 'default': True}
            }
            
            for nombre, datos in roles_default.items():
                Rol.objects.get_or_create(
                    nombre=nombre,
                    defaults=datos
                )

            # Asignar el rol seleccionado
            rol = Rol.objects.get(nombre=rol_nombre)
            user.rol = rol
            user.save()

            return user
        except Exception as e:
            raise serializers.ValidationError(str(e))

class UsuarioSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'nombres', 'apellidos', 'nombre_artistico',
            'telefono', 'direccion', 'fecha_nacimiento',
            'cedula', 'emergencyContact', 'rol', 'role'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_role(self, obj):
        if obj.rol:
            if obj.rol.nombre.lower() in ['administrador', 'admin']:
                return 'admin'
            elif obj.rol.nombre.lower() == 'artista':
                return 'artist'
            else:
                return 'listener'
        return 'listener'

    def validate(self, attrs):
        # Validar email único al actualizar/crear vía este serializer
        email = attrs.get('email')
        username = attrs.get('username')
        instance = getattr(self, 'instance', None)

        if email:
            qs = Usuario.objects.filter(email__iexact=email)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError({'email': 'Ya existe un usuario con ese correo.'})

        if username:
            qs_u = Usuario.objects.filter(username=username)
            if instance:
                qs_u = qs_u.exclude(pk=instance.pk)
            if qs_u.exists():
                raise serializers.ValidationError({'username': 'Ya existe un usuario con ese nombre de usuario.'})

        return super().validate(attrs)

class UsuarioRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioRol
        fields = ['id', 'usuario', 'rol', 'asignado_en']
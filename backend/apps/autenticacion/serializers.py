from rest_framework import serializers
from .models import Usuario, Rol, UsuarioRol

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'nivel', 'default']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    rol = serializers.ChoiceField(choices=['Administrador', 'Artista', 'Oyente'], default='Oyente')

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'nombres', 'apellidos', 'rol']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False},
        }

    def create(self, validated_data):
        try:
            # Si no se proporcionó username, usar la parte del email antes del @
            if 'username' not in validated_data:
                validated_data['username'] = validated_data['email'].split('@')[0]

            # Extraer la contraseña y el rol del diccionario
            password = validated_data.pop('password')
            rol_nombre = validated_data.pop('rol')

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
            'id', 'username', 'email', 'nombres', 'apellidos',
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

class UsuarioRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioRol
        fields = ['id', 'usuario', 'rol', 'asignado_en']
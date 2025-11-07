from django.db import models
from django.contrib.auth.models import AbstractUser


class TimeStampedModel(models.Model):
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Rol(models.Model):
    ADMIN = 'Administrador'
    ARTIST = 'Artista'
    LISTENER = 'Oyente'
    
    ROL_CHOICES = [
        (ADMIN, 'Administrador'),
        (ARTIST, 'Artista'),
        (LISTENER, 'Oyente'),
    ]

    nombre = models.CharField(
        max_length=30,
        unique=True,
        choices=ROL_CHOICES
    )
    nivel = models.FloatField(default=1)
    default = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Rol"
        verbose_name_plural = "Roles"

    def __str__(self):
        return f"{self.nombre} (Nivel {self.nivel})"

    @classmethod
    def create_default_roles(cls):
        """Crea los roles por defecto si no existen"""
        roles = {
            cls.ADMIN: {'nivel': 3, 'default': False},
            cls.ARTIST: {'nivel': 2, 'default': False},
            cls.LISTENER: {'nivel': 1, 'default': True},
        }
        
        for nombre, data in roles.items():
            cls.objects.get_or_create(
                nombre=nombre,
                defaults={'nivel': data['nivel'], 'default': data['default']}
            )

class Recurso(models.Model):
    nombre = models.CharField(max_length=50)
    icono = models.CharField(max_length=100)
    path_frontend = models.CharField(max_length=100)
    path_backend = models.CharField(max_length=200)
    metodo_http = models.CharField(max_length=10)
    orden = models.PositiveIntegerField(default=0)
    padre = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='hijos')

    class Meta:
        verbose_name = "Recurso"
        verbose_name_plural = "Recursos"

    def __str__(self):
        return self.nombre

class RecursoRol(models.Model):
    recurso = models.ForeignKey(Recurso, on_delete=models.CASCADE, related_name='roles')
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name='recursos')
    view = models.BooleanField(default=False)
    create = models.BooleanField(default=False)
    update = models.BooleanField(default=False)
    delete = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Recurso por Rol"
        verbose_name_plural = "Recursos por Rol"
        unique_together = ['recurso', 'rol']

    def __str__(self):
        return f"{self.rol} → {self.recurso}"


class Usuario(AbstractUser):
    rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, blank=True)
    nombres = models.CharField(max_length=45, verbose_name="Nombres", help_text="Nombres del usuario")
    apellidos = models.CharField(max_length=45, verbose_name="Apellidos", help_text="Apellidos del usuario")
    telefono = models.CharField(max_length=15, verbose_name="Teléfono", help_text="Número de contacto del usuario", blank=True, null=True)
    direccion = models.CharField(max_length=255, verbose_name="Dirección", help_text="Dirección del usuario", blank=True, null=True)
    fecha_nacimiento = models.DateField(verbose_name="Fecha de nacimiento", null=True, blank=True)
    cedula = models.CharField(max_length=20, verbose_name="Cédula", blank=True, null=True)
    emergencyContact = models.CharField(max_length=100, verbose_name="Contacto de emergencia", blank=True, null=True)
    
    # Sobrescribir las relaciones de grupos y permisos para evitar conflictos
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user'
    )

    class Meta:
        verbose_name = "Perfil de usuario"
        verbose_name_plural = "Perfiles de usuarios"

    def __str__(self):
        return f"{self.nombres} {self.apellidos}" if self.nombres and self.apellidos else self.username


class UsuarioRol(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='roles_asignados')
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name='usuarios_asignados')
    asignado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Asignación de Rol"
        verbose_name_plural = "Asignaciones de Roles"
        unique_together = ['usuario', 'rol']

    def __str__(self):
        return f"{self.usuario} → {self.rol}"

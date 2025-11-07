from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .models import *

from django.contrib.auth.models import Group  



@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
	list_display = ('nombre', 'nivel', 'default')
	search_fields = ('nombre',)
	list_filter = ('nivel', 'default')

@admin.register(Recurso)
class RecursoAdmin(admin.ModelAdmin):
	list_display = ('nombre', 'icono', 'path_frontend', 'path_backend', 'metodo_http', 'orden', 'padre')
	search_fields = ('nombre', 'icono', 'path_frontend', 'path_backend')
	list_filter = ('metodo_http', 'padre')

@admin.register(RecursoRol)
class RecursoRolAdmin(admin.ModelAdmin):
	list_display = ('recurso', 'rol', 'view', 'create', 'update', 'delete')
	list_filter = ('rol', 'recurso', 'view', 'create', 'update', 'delete')

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
	model = get_user_model()
	list_display = ('username', 'email', 'rol', 'is_active', 'is_staff')
	search_fields = ('username', 'email')
	list_filter = ('rol', 'is_active', 'is_staff')

	fieldsets = (
		(None, {'fields': ('username', 'password')}),
	('Información personal', {'fields': ('nombres', 'apellidos', 'email', 'telefono', 'direccion', 'fecha_nacimiento', 'cedula', 'emergencyContact', 'rol')}),
		('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
	)
	add_fieldsets = (
		(None, {
			'classes': ('wide',),
			'fields': ('username', 'password1', 'password2', 'email', 'rol'),
		}),
	)

	def save_model(self, request, obj, form, change):
		# Si el usuario se crea y no tiene rol, asignar rol 'user' automáticamente
		if not obj.rol:
			from .models import Rol
			try:
				rol_user = Rol.objects.get(nombre__iexact='user')
			except Rol.DoesNotExist:
				rol_user = Rol.objects.create(nombre='user')
			obj.rol = rol_user
		super().save_model(request, obj, form, change)

@admin.register(UsuarioRol)
class UsuarioRolAdmin(admin.ModelAdmin):
	list_display = ('usuario', 'rol', 'asignado_en')
	list_filter = ('rol', 'usuario')

admin.site.unregister(Group)

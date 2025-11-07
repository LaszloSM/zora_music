from django.contrib import admin
from .models import Cancion, Genero


@admin.register(Genero)
class GeneroAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


@admin.register(Cancion)
class CancionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'uploaded_by', 'play_count', 'created_at')
    search_fields = (
        'title',
        'album',
        'uploaded_by__nombres',
        'uploaded_by__apellidos',
        'uploaded_by__email',
    )

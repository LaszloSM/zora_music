from django.contrib import admin
from .models import Album, Cancion, Genero, CancionFavorita, HistorialReproduccion


@admin.register(Genero)
class GeneroAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'get_artist_name', 'release_date', 'created_at')
    search_fields = ('title', 'artist__nombres', 'artist__apellidos', 'artist__email')
    list_filter = ('release_date', 'created_at')

    def get_artist_name(self, obj):
        if not obj.artist:
            return 'Sin artista'
        return obj.artist.get_full_name() or obj.artist.email

    get_artist_name.short_description = 'Artista'


@admin.register(Cancion)
class CancionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'get_artista_nombre', 'get_album_title', 'genre', 'duration', 'play_count', 'created_at')
    list_filter = ('genre', 'created_at')
    search_fields = (
        'title',
        'album__title',
        'uploaded_by__nombres',
        'uploaded_by__apellidos',
        'uploaded_by__email',
    )
    readonly_fields = ('play_count', 'created_at')
    
    def get_artista_nombre(self, obj):
        return f"{obj.uploaded_by.nombres} {obj.uploaded_by.apellidos}" if obj.uploaded_by else "Sin artista"
    get_artista_nombre.short_description = 'Artista'

    def get_album_title(self, obj):
        return obj.album.title if obj.album else 'Single'

    get_album_title.short_description = 'Álbum'


@admin.register(CancionFavorita)
class CancionFavoritaAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'cancion', 'agregada_en')
    list_filter = ('agregada_en',)
    search_fields = ('usuario__email', 'cancion__title')
    readonly_fields = ('agregada_en',)


@admin.register(HistorialReproduccion)
class HistorialReproduccionAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'cancion', 'played_at')
    list_filter = ('played_at',)
    search_fields = ('usuario__email', 'cancion__title')
    readonly_fields = ('played_at',)

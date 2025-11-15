from rest_framework import serializers
from django.urls import reverse

from .models import Album, Cancion, Genero, CancionFavorita, HistorialReproduccion
from django.contrib.auth import get_user_model

User = get_user_model()


class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = ['id', 'name']


class UserBasicSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'nombres', 'apellidos', 'nombre_completo', 'nombre_artistico']

    def get_nombre_completo(self, obj):
        # Si es artista y tiene nombre artístico, usarlo
        if obj.rol and obj.rol.nombre == 'Artista' and obj.nombre_artistico:
            return obj.nombre_artistico
        # Si es oyente o no tiene nombre artístico, usar username
        return obj.username or obj.email


class AlbumSerializer(serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = ['id', 'title', 'cover_url', 'release_date', 'artist']
        read_only_fields = ['artist']

    def get_cover_url(self, obj):
        request = self.context.get('request')
        if obj.cover and hasattr(obj.cover, 'url'):
            return request.build_absolute_uri(obj.cover.url) if request else obj.cover.url
        return None


class CancionSerializer(serializers.ModelSerializer):
    genre = GeneroSerializer(read_only=True)
    artista = UserBasicSerializer(source='uploaded_by', read_only=True)
    album = AlbumSerializer(read_only=True)
    album_id = serializers.PrimaryKeyRelatedField(
        queryset=Album.objects.all(), source='album', required=False, allow_null=True, write_only=True
    )
    cover_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Cancion
        fields = ['id', 'title', 'artista', 'album', 'album_id', 'genre', 'duration', 'file', 'cover', 'cover_url', 'audio_url', 'uploaded_by', 'play_count', 'created_at', 'is_favorite']
        read_only_fields = ['uploaded_by', 'play_count', 'created_at', 'cover_url', 'audio_url', 'is_favorite', 'album']

    def get_cover_url(self, obj):
        request = self.context.get('request')
        if obj.cover and hasattr(obj.cover, 'url'):
            if request:
                return request.build_absolute_uri(obj.cover.url)
            return obj.cover.url
        return None

    def get_audio_url(self, obj):
        request = self.context.get('request')
        if not obj.file:
            return None
        try:
            url = reverse('cancion_transmitir', kwargs={'pk': obj.pk})
        except Exception:
            return None
        return request.build_absolute_uri(url) if request else url

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CancionFavorita.objects.filter(usuario=request.user, cancion=obj).exists()
        return False


class CancionFavoritaSerializer(serializers.ModelSerializer):
    cancion = CancionSerializer(read_only=True)
    
    class Meta:
        model = CancionFavorita
        fields = ['id', 'cancion', 'agregada_en']
        read_only_fields = ['agregada_en']


class HistorialReproduccionSerializer(serializers.ModelSerializer):
    cancion = CancionSerializer(read_only=True)
    
    class Meta:
        model = HistorialReproduccion
        fields = ['id', 'cancion', 'played_at']
        read_only_fields = ['played_at']

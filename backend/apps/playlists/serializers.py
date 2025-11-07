from rest_framework import serializers
from .models import Playlist, Favorite
from apps.musica.serializers import CancionSerializer


class PlaylistSerializer(serializers.ModelSerializer):
    songs = CancionSerializer(many=True, read_only=True)

    class Meta:
        model = Playlist
        fields = ['id', 'name', 'user', 'songs', 'is_public', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


class FavoriteSerializer(serializers.ModelSerializer):
    song = CancionSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'song', 'added_at']
        read_only_fields = ['user', 'added_at']


# Alias en español
class ListaSerializer(PlaylistSerializer):
    pass

class FavoritoSerializer(FavoriteSerializer):
    pass

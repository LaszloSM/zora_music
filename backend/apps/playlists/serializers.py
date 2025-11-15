from rest_framework import serializers
from .models import Playlist, Favorite
from apps.musica.serializers import CancionSerializer


class PlaylistSerializer(serializers.ModelSerializer):
    songs = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = ['id', 'name', 'description', 'user', 'songs', 'is_public', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_songs(self, obj):
        serializer = CancionSerializer(obj.songs.all(), many=True, context=self.context)
        return serializer.data


class FavoriteSerializer(serializers.ModelSerializer):
    song = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'song', 'added_at']
        read_only_fields = ['user', 'added_at']

    def get_song(self, obj):
        serializer = CancionSerializer(obj.song, context=self.context)
        return serializer.data


# Alias en español
class ListaSerializer(PlaylistSerializer):
    pass

class FavoritoSerializer(FavoriteSerializer):
    pass

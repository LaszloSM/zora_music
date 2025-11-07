from rest_framework import serializers
from .models import Cancion, Genero
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
        fields = ['id', 'email', 'nombres', 'apellidos', 'nombre_completo']

    def get_nombre_completo(self, obj):
        return f"{obj.nombres} {obj.apellidos}".strip() or obj.email


class CancionSerializer(serializers.ModelSerializer):
    genre = GeneroSerializer(read_only=True)
    artista = UserBasicSerializer(source='uploaded_by', read_only=True)

    class Meta:
        model = Cancion
        fields = ['id', 'title', 'artista', 'album', 'genre', 'duration', 'file', 'uploaded_by', 'play_count', 'created_at']
        read_only_fields = ['uploaded_by', 'play_count', 'created_at']

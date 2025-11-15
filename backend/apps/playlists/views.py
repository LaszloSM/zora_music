from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Playlist, Favorite
from .serializers import PlaylistSerializer, FavoriteSerializer
from apps.musica.models import Cancion


class PlaylistListCreateView(generics.ListCreateAPIView):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user).prefetch_related(
            'songs__uploaded_by',
            'songs__genre'
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PlaylistRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Playlist.objects.all().prefetch_related(
            'songs__uploaded_by',
            'songs__genre'
        )

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            self.permission_denied(self.request, message='No permitido')
        return obj


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def agregar_cancion_a_lista(request, pk):
    playlist = get_object_or_404(Playlist, pk=pk, user=request.user)
    song_id = request.data.get('song_id')
    if not song_id:
        return Response({'detail': 'song_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
    song = get_object_or_404(Cancion, pk=song_id)
    playlist.songs.add(song)
    # Retornar el playlist actualizado
    serializer = PlaylistSerializer(playlist, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def quitar_cancion_de_lista(request, pk):
    playlist = get_object_or_404(Playlist, pk=pk, user=request.user)
    song_id = request.data.get('song_id')
    if not song_id:
        return Response({'detail': 'song_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
    song = get_object_or_404(Cancion, pk=song_id)
    playlist.songs.remove(song)
    # Retornar el playlist actualizado
    serializer = PlaylistSerializer(playlist, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        song_id = self.request.data.get('song_id')
        song = get_object_or_404(Cancion, pk=song_id)
        serializer.save(user=self.request.user, song=song)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_favorite(request, pk):
    fav = get_object_or_404(Favorite, pk=pk, user=request.user)
    fav.delete()
    return Response({'detail': 'Favorito eliminado'}, status=status.HTTP_200_OK)

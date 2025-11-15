from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Playlist, Favorite
from .serializers import PlaylistSerializer, FavoriteSerializer
from apps.musica.models import Cancion


def _get_request_user_id(request):
    """Obtiene el ID del usuario autenticado de forma robusta.

    Intenta en este orden:
    1) request.user.pk si es un usuario real
    2) atributo id en request.user (p. ej. TokenUser/StatelessUser)
    3) claim 'user_id' dentro de request.auth (token decodificado)
    """
    user = getattr(request, 'user', None)
    if user is not None:
        # Caso típico: instancia real de usuario
        pk = getattr(user, 'pk', None)
        if pk is not None:
            return pk
        # Algunos backends de autenticación exponen id pero no pk
        uid = getattr(user, 'id', None)
        if uid is not None:
            return uid

    # Si no hay instancia de usuario, intentar obtener del token
    auth = getattr(request, 'auth', None)
    # Validated token puede ser un dict-like
    try:
        if auth and hasattr(auth, 'get'):
            uid = auth.get('user_id')
            if uid is not None:
                return uid
    except Exception:
        pass

    # Algunos objetos de token exponen payload
    payload = getattr(auth, 'payload', None)
    if isinstance(payload, dict):
        uid = payload.get('user_id')
        if uid is not None:
            return uid

    return None


class PlaylistListCreateView(generics.ListCreateAPIView):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = _get_request_user_id(self.request)
        return Playlist.objects.filter(user_id=user_id).prefetch_related(
            'songs__uploaded_by',
            'songs__genre'
        )

    def perform_create(self, serializer):
        user_id = _get_request_user_id(self.request)
        if user_id is None:
            # Forzar error de validación claro en lugar de 500
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'Usuario no autenticado'})
        serializer.save(user_id=user_id)


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
        if obj.user_id != _get_request_user_id(self.request):
            self.permission_denied(self.request, message='No permitido')
        return obj


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def agregar_cancion_a_lista(request, pk):
    user_id = _get_request_user_id(request)
    playlist = get_object_or_404(Playlist, pk=pk, user_id=user_id)
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
    user_id = _get_request_user_id(request)
    playlist = get_object_or_404(Playlist, pk=pk, user_id=user_id)
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
        return Favorite.objects.filter(user_id=_get_request_user_id(self.request))

    def perform_create(self, serializer):
        song_id = self.request.data.get('song_id')
        song = get_object_or_404(Cancion, pk=song_id)
        user_id = _get_request_user_id(self.request)
        if user_id is None:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'Usuario no autenticado'})
        serializer.save(user_id=user_id, song=song)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_favorite(request, pk):
    fav = get_object_or_404(Favorite, pk=pk, user_id=_get_request_user_id(request))
    fav.delete()
    return Response({'detail': 'Favorito eliminado'}, status=status.HTTP_200_OK)

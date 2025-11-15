from django.db.models import Q
from django.http import FileResponse, Http404, StreamingHttpResponse
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Cancion, Genero, CancionFavorita, HistorialReproduccion
from .serializers import CancionSerializer, GeneroSerializer, CancionFavoritaSerializer, HistorialReproduccionSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from apps.autenticacion.permissions import IsArtistaOrAdmin


class CancionListCreateView(generics.ListCreateAPIView):
    """Lista y creación de canciones. Solo artistas o administradores pueden subir archivos."""
    queryset = Cancion.objects.all().order_by('-created_at')
    serializer_class = CancionSerializer
    # permitir lectura a cualquiera; crear/editar/eliminar solo artistas o administradores
    permission_classes = [IsArtistaOrAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        user = self.request.user
        # la verificación de rol se realiza en el permission class IsArtistaOrAdmin
        # y también en el modelo Cancion.save()
        genre_name = self.request.data.get('genre')
        genre = None
        if genre_name:
            genre, _ = Genero.objects.get_or_create(name=genre_name)
        # Usar uploaded_by_id para compatibilidad cuando request.user es TokenUser (SimpleJWT)
        serializer.save(uploaded_by_id=getattr(user, 'id', None), genre=genre)


class CancionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cancion.objects.all()
    serializer_class = CancionSerializer
    # permitir GET para cualquiera; operaciones que modifican/eliminan requieren artista/admin
    permission_classes = [IsArtistaOrAdmin]


@api_view(['GET'])
def buscar_canciones(request):
    q = request.query_params.get('q', '')
    queryset = Cancion.objects.all()
    if q:
        queryset = queryset.filter(
            Q(title__icontains=q) | 
            Q(album__title__icontains=q) | 
            Q(uploaded_by__first_name__icontains=q) |
            Q(uploaded_by__last_name__icontains=q) |
            Q(genre__name__icontains=q)
        )
    serializer = CancionSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def transmitir_cancion(request, pk):
    """Devuelve el archivo de audio con soporte para solicitudes parciales (Range)."""
    song = get_object_or_404(Cancion, pk=pk)
    if not song.file:
        raise Http404('Archivo de audio no encontrado')

    audio_file = song.file.open('rb')
    file_size = song.file.size
    range_header = request.headers.get('Range')
    response = None

    should_increment_playcount = True

    if range_header:
        # Formato esperado: "bytes=start-end"
        try:
            range_value = range_header.strip().lower()
            units, _, range_spec = range_value.partition('=')
            if units != 'bytes':
                raise ValueError('Unidad de rango no soportada')
            start_str, _, end_str = range_spec.partition('-')
            start = int(start_str) if start_str else 0
            end = int(end_str) if end_str else file_size - 1
            end = min(end, file_size - 1)
            if start > end or start < 0:
                raise ValueError('Rango inválido')
        except (ValueError, IndexError):
            audio_file.close()
            response_416 = Response(status=416)
            response_416['Content-Range'] = f'bytes */{file_size}'
            return response_416

        chunk_size = (end - start) + 1
        should_increment_playcount = start == 0
        audio_file.seek(start)

        def file_iterator(file_obj, length):
            remaining = length
            chunk = 1024 * 64
            try:
                while remaining > 0:
                    read_length = min(chunk, remaining)
                    data = file_obj.read(read_length)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data
            finally:
                file_obj.close()

        response = StreamingHttpResponse(file_iterator(audio_file, chunk_size), status=206, content_type='audio/mpeg')
        response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
        response['Content-Length'] = str(chunk_size)
    else:
        response = FileResponse(audio_file, content_type='audio/mpeg')
        response['Content-Length'] = str(file_size)

    response['Accept-Ranges'] = 'bytes'
    if should_increment_playcount:
        song.play_count = (song.play_count or 0) + 1
        song.save(update_fields=['play_count'])
    return response


class GeneroListView(generics.ListAPIView):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer
    permission_classes = [permissions.AllowAny]


# ========== ENDPOINTS DE FAVORITOS ==========

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def listar_favoritos(request):
    """Lista todas las canciones favoritas del usuario autenticado"""
    favoritos = CancionFavorita.objects.filter(usuario_id=getattr(request.user, 'id', None)).select_related('cancion')
    canciones = [fav.cancion for fav in favoritos]
    serializer = CancionSerializer(canciones, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def agregar_favorito(request, cancion_id):
    """Agrega una canción a favoritos"""
    cancion = get_object_or_404(Cancion, pk=cancion_id)
    favorito, created = CancionFavorita.objects.get_or_create(
        usuario_id=getattr(request.user, 'id', None),
        cancion=cancion
    )
    if created:
        return Response({'message': 'Canción agregada a favoritos'}, status=status.HTTP_201_CREATED)
    return Response({'message': 'La canción ya está en favoritos'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def quitar_favorito(request, cancion_id):
    """Quita una canción de favoritos"""
    try:
        favorito = CancionFavorita.objects.get(usuario_id=getattr(request.user, 'id', None), cancion_id=cancion_id)
        favorito.delete()
        return Response({'message': 'Canción quitada de favoritos'}, status=status.HTTP_200_OK)
    except CancionFavorita.DoesNotExist:
        return Response({'message': 'La canción no está en favoritos'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verificar_favorito(request, cancion_id):
    """Verifica si una canción está en favoritos"""
    es_favorito = CancionFavorita.objects.filter(usuario_id=getattr(request.user, 'id', None), cancion_id=cancion_id).exists()
    return Response({'is_favorite': es_favorito})


# ========== ENDPOINTS DE HISTORIAL ==========

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def listar_historial(request):
    """Lista el historial de reproducciones del usuario (últimas 50)"""
    historial = HistorialReproduccion.objects.filter(usuario_id=getattr(request.user, 'id', None)).select_related('cancion')[:50]
    # Obtener canciones únicas (sin duplicados)
    canciones_ids = []
    canciones_unicas = []
    for item in historial:
        if item.cancion.id not in canciones_ids:
            canciones_ids.append(item.cancion.id)
            canciones_unicas.append(item.cancion)
    
    serializer = CancionSerializer(canciones_unicas, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def registrar_reproduccion(request, cancion_id):
    """Registra una reproducción en el historial"""
    cancion = get_object_or_404(Cancion, pk=cancion_id)
    HistorialReproduccion.objects.create(
        usuario_id=getattr(request.user, 'id', None),
        cancion=cancion
    )
    return Response({'message': 'Reproducción registrada'}, status=status.HTTP_201_CREATED)


# ========== ENDPOINTS DE ESTADÍSTICAS EN TIEMPO CASI REAL ==========

@api_view(['GET'])
def reproducciones_cancion(request, pk: int):
    """Devuelve el contador de reproducciones de una canción."""
    song = get_object_or_404(Cancion, pk=pk)
    return Response({'id': song.id, 'play_count': song.play_count})


@api_view(['GET'])
def reproducciones_multiples(request):
    """Devuelve contadores para múltiples canciones (?ids=1,2,3)."""
    ids_param = request.query_params.get('ids', '')
    try:
        ids = [int(x) for x in ids_param.split(',') if x.strip().isdigit()]
    except Exception:
        ids = []
    if not ids:
        return Response({'detail': 'Parámetro ids requerido'}, status=status.HTTP_400_BAD_REQUEST)
    qs = Cancion.objects.filter(id__in=ids).values('id', 'play_count')
    return Response({'results': list(qs)})

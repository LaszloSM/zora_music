from django.db.models import Q
from django.http import FileResponse, Http404
from rest_framework import generics, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Cancion, Genero
from .serializers import CancionSerializer, GeneroSerializer
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
        serializer.save(uploaded_by=user, genre=genre)


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
            Q(album__icontains=q) | 
            Q(uploaded_by__first_name__icontains=q) |
            Q(uploaded_by__last_name__icontains=q) |
            Q(genre__name__icontains=q)
        )
    serializer = CancionSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def transmitir_cancion(request, pk):
    """Devuelve el archivo de audio; incrementa el contador de reproducciones."""
    song = get_object_or_404(Cancion, pk=pk)
    if not song.file:
        raise Http404('Archivo de audio no encontrado')
    song.play_count = (song.play_count or 0) + 1
    song.save(update_fields=['play_count'])
    response = FileResponse(song.file.open('rb'), content_type='audio/mpeg')
    response['Content-Length'] = song.file.size
    return response


class GeneroListView(generics.ListAPIView):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer
    permission_classes = [permissions.AllowAny]

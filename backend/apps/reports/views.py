from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from apps.musica.models import Cancion
from django.db import models


@api_view(['GET'])
@permission_classes([IsAdminUser])
def top_canciones(request):
    """Devuelve el top 10 de canciones por reproducciones."""
    qs = Cancion.objects.all().order_by('-play_count')[:10]
    data = [{'id': s.id, 'titulo': s.title, 'artista': str(s.artist), 'reproducciones': s.play_count} for s in qs]
    return Response({'top_canciones': data})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def resumen_estadisticas(request):
    total_canciones = Cancion.objects.count()
    total_reproducciones = Cancion.objects.aggregate(total=models.Sum('play_count'))['total'] or 0
    return Response({'total_canciones': total_canciones, 'total_reproducciones': total_reproducciones})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resumen_artista(request):
    """Resumen en tiempo real para el artista autenticado (o admin)."""
    user = request.user
    # Admin puede pasar ?user_id= para consultar otro artista
    user_id = request.query_params.get('user_id')
    if user_id and getattr(user, 'rol', None) and user.rol and user.rol.nombre in ('Administrador',):
        try:
            from apps.autenticacion.models import Usuario
            user = Usuario.objects.get(pk=int(user_id))
        except Exception:
            pass
    qs = Cancion.objects.filter(uploaded_by=user)
    total_reproducciones = qs.aggregate(total=models.Sum('play_count'))['total'] or 0
    canciones = list(qs.values('id', 'title', 'play_count').order_by('-play_count'))
    return Response({'total_reproducciones': total_reproducciones, 'canciones': canciones})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def resumen_admin_live(request):
    """Resumen detallado para administrador en tiempo real."""
    total_canciones = Cancion.objects.count()
    total_reproducciones = Cancion.objects.aggregate(total=models.Sum('play_count'))['total'] or 0
    top = list(Cancion.objects.all().order_by('-play_count').values('id', 'title', 'play_count')[:10])
    return Response({'total_canciones': total_canciones, 'total_reproducciones': total_reproducciones, 'top': top})

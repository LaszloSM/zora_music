from django.urls import path
from . import views

urlpatterns = [
    path('', views.CancionListCreateView.as_view(), name='cancion_list_create'),
    path('<int:pk>/', views.CancionRetrieveUpdateDestroyView.as_view(), name='cancion_detalle'),
    path('buscar/', views.buscar_canciones, name='cancion_buscar'),
    path('transmitir/<int:pk>/', views.transmitir_cancion, name='cancion_transmitir'),
    path('generos/', views.GeneroListView.as_view(), name='genero_list'),
    
    # Favoritos
    path('favoritos/', views.listar_favoritos, name='favoritos_list'),
    path('favoritos/<int:cancion_id>/', views.verificar_favorito, name='favorito_verificar'),
    path('favoritos/<int:cancion_id>/agregar/', views.agregar_favorito, name='favorito_agregar'),
    path('favoritos/<int:cancion_id>/quitar/', views.quitar_favorito, name='favorito_quitar'),
    
    # Historial
    path('historial/', views.listar_historial, name='historial_list'),
    path('historial/<int:cancion_id>/registrar/', views.registrar_reproduccion, name='historial_registrar'),
    
    # Estadísticas / contador de reproducciones
    path('plays/<int:pk>/', views.reproducciones_cancion, name='cancion_reproducciones'),
    path('plays/', views.reproducciones_multiples, name='canciones_reproducciones_multiples'),
]

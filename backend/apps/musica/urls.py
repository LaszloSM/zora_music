from django.urls import path
from . import views

urlpatterns = [
    path('', views.CancionListCreateView.as_view(), name='cancion_list_create'),
    path('<int:pk>/', views.CancionRetrieveUpdateDestroyView.as_view(), name='cancion_detalle'),
    path('buscar/', views.buscar_canciones, name='cancion_buscar'),
    path('transmitir/<int:pk>/', views.transmitir_cancion, name='cancion_transmitir'),
    path('generos/', views.GeneroListView.as_view(), name='genero_list'),
]

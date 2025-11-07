from django.urls import path
from . import views

urlpatterns = [
    path('', views.PlaylistListCreateView.as_view(), name='lista_list_create'),
    path('<int:pk>/', views.PlaylistRetrieveUpdateDestroyView.as_view(), name='lista_detalle'),
    path('<int:pk>/agregar-cancion/', views.agregar_cancion_a_lista, name='lista_agregar_cancion'),
    path('<int:pk>/quitar-cancion/', views.quitar_cancion_de_lista, name='lista_quitar_cancion'),
    path('favoritos/', views.FavoriteListCreateView.as_view(), name='favoritos_list_create'),
    path('favoritos/<int:pk>/', views.remove_favorite, name='favorito_remove'),
]

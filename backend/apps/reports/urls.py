from django.urls import path
from . import views

urlpatterns = [
    path('top-canciones/', views.top_canciones, name='top_canciones'),
    path('resumen/', views.resumen_estadisticas, name='resumen_estadisticas'),
    path('artista/resumen/', views.resumen_artista, name='resumen_artista'),
    path('admin/resumen-live/', views.resumen_admin_live, name='resumen_admin_live'),
]

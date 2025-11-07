from django.urls import path
from . import views

urlpatterns = [
    path('top-canciones/', views.top_canciones, name='top_canciones'),
    path('resumen/', views.resumen_estadisticas, name='resumen_estadisticas'),
]

from django.urls import path
from .views import (
    CookieLoginView, RegisterView, LogoutView, ProfileView,
    ChangePasswordView, RolListCreateView, RolRetrieveUpdateDestroyView,
    UsuarioRolCreateView, HelloFromCookieView, UsuarioListView,
    UsuarioRetrieveUpdateDestroyView, AdminSetUserPasswordView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('login/', CookieLoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('roles/', RolListCreateView.as_view(), name='rol_list_create'),
    path('roles/<int:pk>/', RolRetrieveUpdateDestroyView.as_view(), name='rol_detail'),
    path('roles/asignar-rol/', UsuarioRolCreateView.as_view(), name='usuario_rol_create'),
    path('usuarios/', UsuarioListView.as_view(), name='usuario_list'),
    path('usuarios/<int:pk>/', UsuarioRetrieveUpdateDestroyView.as_view(), name='usuario_detail'),
    path('usuarios/<int:pk>/set-password/', AdminSetUserPasswordView.as_view(), name='usuario_set_password'),
]

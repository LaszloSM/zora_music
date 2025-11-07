from django.contrib import admin
from .models import Playlist, Favorite


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'is_public', 'created_at')
    search_fields = ('name', 'user__username')


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'song', 'added_at')

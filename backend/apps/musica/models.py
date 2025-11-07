from django.db import models
from django.conf import settings


class Genero(models.Model):
    name = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Género'
        verbose_name_plural = 'Géneros'


def cancion_upload_path(instance, filename):
    return f'canciones/{instance.id or "new"}/{filename}'


class Cancion(models.Model):
    title = models.CharField(max_length=200)
    album = models.CharField(max_length=200, blank=True)
    genre = models.ForeignKey(Genero, null=True, blank=True, on_delete=models.SET_NULL)
    duration = models.IntegerField(null=True, blank=True, help_text='Duration in seconds')
    file = models.FileField(upload_to=cancion_upload_path, null=True, blank=True)
    # El artista es el usuario con rol 'artista' que subió la canción
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Artista',
        help_text='Usuario con rol de artista que subió la canción'
    )
    play_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # El artista es el usuario que subió la canción (que debe tener rol artista)
        return f"{self.title} - {self.uploaded_by.get_full_name() or self.uploaded_by.email}"

    class Meta:
        verbose_name = 'Canción'
        verbose_name_plural = 'Canciones'

    def save(self, *args, **kwargs):
        # Asegurarnos que solo usuarios con rol artista puedan subir canciones
        if not self.pk and self.uploaded_by:
            user = self.uploaded_by
            if not hasattr(user, 'rol') or not user.rol or user.rol.nombre.lower() != 'artista':
                raise ValueError('Solo usuarios con rol de artista pueden subir canciones')
        super().save(*args, **kwargs)

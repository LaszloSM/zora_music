import logging
from pathlib import Path

from django.conf import settings
from django.db import models

try:
    from mutagen import File as MutagenFile  # type: ignore
except ImportError:  # pragma: no cover - fallback when mutagen is missing
    MutagenFile = None


logger = logging.getLogger(__name__)


class Genero(models.Model):
    name = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Género'
        verbose_name_plural = 'Géneros'


def cancion_upload_path(instance, filename):
    return f'canciones/{instance.id or "new"}/{filename}'


def portada_upload_path(instance, filename):
    return f'portadas/{instance.id or "new"}/{filename}'


class Album(models.Model):
    title = models.CharField(max_length=200)
    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='albumes',
        help_text='Artista responsable del álbum',
    )
    cover = models.ImageField(upload_to=portada_upload_path, null=True, blank=True)
    release_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Álbum'
        verbose_name_plural = 'Álbumes'
        ordering = ['title']

    def __str__(self):
        if self.artist:
            return f"{self.title} - {self.artist.get_full_name() or self.artist.email}"
        return self.title


class Cancion(models.Model):
    title = models.CharField(max_length=200)
    album = models.ForeignKey(
        Album,
        null=True,
        blank=True,
        related_name='songs',
        on_delete=models.SET_NULL,
        help_text='Álbum opcional al que pertenece la canción',
    )
    genre = models.ForeignKey(Genero, null=True, blank=True, on_delete=models.SET_NULL)
    duration = models.IntegerField(null=True, blank=True, help_text='Duration in seconds')
    file = models.FileField(upload_to=cancion_upload_path, null=True, blank=True)
    cover = models.ImageField(upload_to=portada_upload_path, null=True, blank=True, verbose_name='Portada')
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

        updating_duration = False
        if self.file and (self._state.adding or not self.duration):
            updating_duration = True
        elif self.file and self.pk:
            try:
                previous = Cancion.objects.get(pk=self.pk)
                if previous.file != self.file:
                    updating_duration = True
            except Cancion.DoesNotExist:  # pragma: no cover - safety in concurrent writes
                updating_duration = True

        super().save(*args, **kwargs)

        if updating_duration and MutagenFile:
            try:
                path = Path(self.file.path)
            except (ValueError, AttributeError):
                path = None

            if path and path.exists():
                try:
                    audio = MutagenFile(str(path))
                    length = int(audio.info.length) if audio and audio.info and audio.info.length else None
                except Exception as exc:  # pragma: no cover - defensive logging
                    logger.warning('No se pudo calcular la duración de %s: %s', self.id, exc)
                    length = None

                if length and length > 0 and self.duration != length:
                    self.duration = length
                    super().save(update_fields=['duration'])



class CancionFavorita(models.Model):
    """Modelo para gestionar las canciones favoritas de los usuarios"""
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='canciones_favoritas'
    )
    cancion = models.ForeignKey(
        Cancion,
        on_delete=models.CASCADE,
        related_name='favoritos'
    )
    agregada_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Canción Favorita'
        verbose_name_plural = 'Canciones Favoritas'
        unique_together = ['usuario', 'cancion']
        ordering = ['-agregada_en']

    def __str__(self):
        return f"{self.usuario.email} - {self.cancion.title}"


class HistorialReproduccion(models.Model):
    """Modelo para registrar el historial de reproducciones"""
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='historial_reproducciones'
    )
    cancion = models.ForeignKey(
        Cancion,
        on_delete=models.CASCADE,
        related_name='historial'
    )
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Historial de Reproducción'
        verbose_name_plural = 'Historial de Reproducciones'
        ordering = ['-played_at']

    def __str__(self):
        return f"{self.usuario.email} - {self.cancion.title} - {self.played_at}"

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, ListMusic } from 'lucide-react';
import { Slider } from './ui/slider';
import { Song } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isShuffled?: boolean;
  onShuffleToggle?: () => void;
  repeatMode?: 'off' | 'all' | 'one';
  onRepeatToggle?: () => void;
  onToggleFavorite?: (songId: string, isFavorite: boolean) => void;
  onShowQueue?: () => void;
  resumeFrom?: number | null;
  onResumeApplied?: () => void;
  onPlaybackSnapshot?: (snapshot: {
    songId: string;
    currentTime: number;
    duration: number;
    isPlaying: boolean;
  }) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
}

export function MusicPlayer({ 
  currentSong, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  isShuffled = false,
  onShuffleToggle,
  repeatMode = 'off',
  onRepeatToggle,
  onToggleFavorite,
  onShowQueue,
  resumeFrom = null,
  onResumeApplied,
  onPlaybackSnapshot,
  onPlaybackStateChange
}: MusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolumeRef = useRef(70);
  const previousSongIdRef = useRef<string | null>(null);
  const resumePositionRef = useRef<number | null>(null);
  const resumeAppliedRef = useRef<(() => void) | null>(null);
  const currentSongRef = useRef<Song | null>(null);

  const VOLUME_STORAGE_KEY = 'zora_player_volume';

  useEffect(() => {
    resumeAppliedRef.current = onResumeApplied || null;
  }, [onResumeApplied]);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  const resolveDuration = useCallback((audio: HTMLAudioElement) => {
    const raw = audio.duration;
    if (Number.isFinite(raw) && raw > 0) {
      return raw;
    }
    const fallback = currentSongRef.current?.duration;
    return typeof fallback === 'number' && fallback > 0 ? fallback : 0;
  }, []);

  const applyResumePosition = useCallback(
    (audio: HTMLAudioElement, position: number | null) => {
      if (position == null) {
        return false;
      }

      const limit = resolveDuration(audio) || position;
      const clamped = Math.max(0, Math.min(position, limit));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
      resumePositionRef.current = null;
      resumeAppliedRef.current?.();
      return true;
    },
    [resolveDuration]
  );

  const attemptPlay = useCallback(
    (audio: HTMLAudioElement) => {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((error: unknown) => {
          if (error && typeof error === 'object' && 'name' in error) {
            const errName = (error as { name?: string }).name;
            if (errName === 'AbortError') {
              return;
            }
          }
          console.error('Error al reproducir:', error);
          onPlaybackStateChange?.(false);
        });
      }
    },
    [onPlaybackStateChange]
  );

  // Crear elemento de audio
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      const resolved = resolveDuration(audio);
      setDuration(resolved);
      if (resumePositionRef.current !== null) {
        applyResumePosition(audio, resumePositionRef.current);
      } else if (audio.currentTime) {
        setCurrentTime(audio.currentTime);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    setAudioElement(audio);

    const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (storedVolume) {
      try {
        const parsed = JSON.parse(storedVolume);
        if (typeof parsed.volume === 'number') {
          setVolume(parsed.volume);
          previousVolumeRef.current = parsed.volume;
          audio.volume = parsed.volume / 100;
        }
        if (parsed.isMuted) {
          setIsMuted(true);
          audio.volume = 0;
        }
      } catch (e) {
        console.warn('No se pudo restaurar el volumen del reproductor', e);
      }
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
      audio.src = '';
    };
  }, [applyResumePosition, resolveDuration]);

  // Persistir estado de volumen
  useEffect(() => {
    try {
      localStorage.setItem(
        VOLUME_STORAGE_KEY,
        JSON.stringify({ volume, isMuted })
      );
    } catch (e) {
      // Ignorar errores de cuota
    }
  }, [volume, isMuted]);

  // Manejar el evento ended del audio con repeatMode actualizado
  useEffect(() => {
    if (!audioElement) return;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audioElement.currentTime = 0;
        audioElement.play().catch(err => console.error('Error al repetir:', err));
      } else {
        onNext();
      }
    };

    audioElement.addEventListener('ended', handleEnded);
    
    return () => {
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioElement, repeatMode, onNext]);

  // Actualizar fuente de audio cuando cambia la canción
  useEffect(() => {
    if (!audioElement || !currentSong?.audioUrl) {
      return;
    }

    const isNewSong = previousSongIdRef.current !== currentSong.id;
    const resumeValue = typeof resumeFrom === 'number' && resumeFrom >= 0 ? resumeFrom : null;

    if (isNewSong) {
      previousSongIdRef.current = currentSong.id;
      resumePositionRef.current = resumeValue;
      audioElement.src = currentSong.audioUrl;
      audioElement.load();

      if (resumeValue != null) {
        setCurrentTime(resumeValue);
      } else {
        setCurrentTime(0);
      }

      const initialDuration = resolveDuration(audioElement);
      if (initialDuration > 0) {
        setDuration(initialDuration);
      } else if (typeof currentSong.duration === 'number' && currentSong.duration > 0) {
        setDuration(currentSong.duration);
      } else {
        setDuration(0);
      }

      if (isPlaying) {
        attemptPlay(audioElement);
      }
    } else if (resumeValue != null) {
      if (audioElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
        applyResumePosition(audioElement, resumeValue);
      } else {
        resumePositionRef.current = resumeValue;
      }
    }
  }, [currentSong, audioElement, isPlaying, resumeFrom, attemptPlay, applyResumePosition, resolveDuration]);

  useEffect(() => {
    if (!currentSong) {
      previousSongIdRef.current = null;
      resumePositionRef.current = null;
    }
  }, [currentSong]);

  // Controlar play/pause
  useEffect(() => {
    if (!audioElement) return;

    if (isPlaying) {
      attemptPlay(audioElement);
    } else if (!audioElement.paused) {
      audioElement.pause();
    }
  }, [isPlaying, audioElement, attemptPlay]);

  // Controlar volumen
  useEffect(() => {
    if (!audioElement) return;
    audioElement.volume = (isMuted ? 0 : volume) / 100;
  }, [volume, audioElement, isMuted]);

  useEffect(() => {
    if (!isMuted) {
      previousVolumeRef.current = volume;
    }
  }, [volume, isMuted]);

  const effectiveDuration = useMemo(() => {
    if (Number.isFinite(duration) && duration > 0) {
      return duration;
    }
    if (currentSong && typeof currentSong.duration === 'number' && currentSong.duration > 0) {
      return currentSong.duration;
    }
    return 0;
  }, [duration, currentSong]);

  const handleSkip = useCallback(
    (seconds: number) => {
      if (!audioElement) return;
      const current = audioElement.currentTime || 0;
      const rawDuration = Number.isFinite(audioElement.duration) && audioElement.duration > 0
        ? audioElement.duration
        : effectiveDuration || Infinity;
      const limit = rawDuration || Infinity;
      const target = Math.max(0, Math.min(current + seconds, limit));
      audioElement.currentTime = target;
      setCurrentTime(target);
    },
    [audioElement, effectiveDuration]
  );

  const handleToggleMute = useCallback(() => {
    if (!audioElement) return;
    if (isMuted) {
      setIsMuted(false);
      setVolume(previousVolumeRef.current);
      audioElement.volume = previousVolumeRef.current / 100;
    } else {
      previousVolumeRef.current = volume;
      setIsMuted(true);
      audioElement.volume = 0;
    }
  }, [audioElement, isMuted, volume]);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    let limit: number | null = effectiveDuration && effectiveDuration > 0 ? effectiveDuration : null;

    if (!limit && audioElement) {
      const raw = audioElement.duration;
      if (Number.isFinite(raw) && raw > 0) {
        limit = raw;
      }
    }

    const clamped = limit !== null && limit > 0 ? Math.min(newTime, limit) : newTime;
    setCurrentTime(clamped);
    if (audioElement) {
      audioElement.currentTime = clamped;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const handledKeys = ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyM'];
      if (!handledKeys.includes(e.code)) {
        return;
      }

      e.preventDefault();

      switch (e.code) {
        case 'Space':
          onPlayPause();
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            onNext();
          } else {
            handleSkip(10);
          }
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            onPrevious();
          } else {
            handleSkip(-10);
          }
          break;
        case 'ArrowUp':
          setVolume((prev) => {
            const next = Math.min(100, prev + 5);
            if (next > 0) {
              setIsMuted(false);
            }
            return next;
          });
          break;
        case 'ArrowDown':
          setVolume((prev) => {
            const next = Math.max(0, prev - 5);
            setIsMuted(next === 0);
            return next;
          });
          break;
        case 'KeyM':
          if (e.ctrlKey || e.metaKey) {
            handleToggleMute();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSkip, onNext, onPlayPause, onPrevious, handleToggleMute]);

  useEffect(() => {
    if (!currentSong || !onPlaybackSnapshot) return;
    onPlaybackSnapshot({
      songId: currentSong.id,
      currentTime,
      duration: effectiveDuration || duration,
      isPlaying,
    });
  }, [currentSong, currentTime, duration, effectiveDuration, isPlaying, onPlaybackSnapshot]);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a1628]/95 border-t border-[#2c5f7d]/40 backdrop-blur-2xl z-50 shadow-2xl shadow-[#0b2740]/30 relative overflow-hidden player-bar">
      <div className="px-4 py-3">
        {/* Barra de progreso */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            max={effectiveDuration > 0 ? effectiveDuration : 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full player-progress-slider"
          />
          <div className="flex justify-between mt-1 text-xs text-[#a8c9e6] font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(effectiveDuration || duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Info de la canción */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <ImageWithFallback
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <h4 className="truncate text-white font-semibold">{currentSong.title}</h4>
              <p className="text-sm text-[#a8c9e6] truncate">{currentSong.artistName}</p>
            </div>
            <button
              onClick={() => onToggleFavorite?.(currentSong.id, currentSong.isFavorite || false)}
              className={`ml-2 transition-all duration-200 ${
                currentSong.isFavorite ? 'text-[#5bc0de] scale-110 drop-shadow-[0_0_12px_rgba(91,192,222,0.5)]' : 'text-[#a8c9e6] hover:text-[#5bc0de] hover:scale-110'
              }`}
            >
              <Heart className={`w-5 h-5 ${currentSong.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Controles centrales */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  console.log('Shuffle button clicked');
                  onShuffleToggle?.();
                }}
                className={`transition-all duration-200 ${
                  isShuffled ? 'text-[#5bc0de] scale-110 drop-shadow-[0_0_12px_rgba(91,192,222,0.45)]' : 'text-[#a8c9e6] hover:text-white hover:scale-110'
                }`}
                title={isShuffled ? 'Desactivar aleatorio' : 'Activar aleatorio'}
              >
                <Shuffle className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  console.log('Previous button clicked');
                  onPrevious();
                }}
                className="text-[#a8c9e6] hover:text-white hover:scale-110 transition-all duration-200"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  console.log('Play/Pause button clicked');
                  onPlayPause();
                }}
                className="bg-gradient-to-br from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] hover:from-[#5bc0de] hover:to-[#7de2ff] text-[#042031] rounded-full p-3 hover:scale-110 transition-all duration-300 shadow-xl shadow-[#0b2740]/40 hover:shadow-[#5bc0de]/40"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </button>
              <button
                onClick={() => {
                  console.log('Next button clicked');
                  onNext();
                }}
                className="text-[#a8c9e6] hover:text-white hover:scale-110 transition-all duration-200"
              >
                <SkipForward className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  console.log('Repeat button clicked');
                  onRepeatToggle?.();
                }}
                className={`relative transition-all duration-200 ${
                  repeatMode !== 'off' ? 'text-[#5bc0de] scale-110 drop-shadow-[0_0_12px_rgba(91,192,222,0.45)]' : 'text-[#a8c9e6] hover:text-white hover:scale-110'
                }`}
                title={
                  repeatMode === 'off' ? 'Repetir desactivado' :
                  repeatMode === 'all' ? 'Repetir cola' :
                  'Repetir canción actual'
                }
              >
                <Repeat className="w-5 h-5" />
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold text-[#7de2ff]">1</span>
                )}
              </button>
            </div>
          </div>

          {/* Control de volumen y cola */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            {onShowQueue && (
              <button
                onClick={onShowQueue}
                className="text-[#a8c9e6] hover:text-white hover:scale-110 transition-all duration-200"
                title="Ver cola de reproducción"
              >
                <ListMusic className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleToggleMute}
              className="text-[#a8c9e6] hover:text-white transition-colors"
              title={isMuted ? 'Reactivar sonido (Ctrl+M)' : 'Silenciar (Ctrl+M)'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24 player-volume-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Song } from '../types';

// Estados del reproductor
export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error';
export type RepeatMode = 'off' | 'all' | 'one';

// Contexto del reproductor
interface PlayerContextType {
  // Estado actual
  currentSong: Song | null;
  playerState: PlayerState;
  queue: Song[];
  currentIndex: number;
  originalQueue: Song[]; // Para shuffle
  isShuffled: boolean;
  repeatMode: RepeatMode;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  buffered: number;

  // Acciones de reproducción
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  
  // Navegación
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  
  // Control de cola
  setQueue: (songs: Song[], startIndex?: number, play?: boolean) => void;
  addToQueue: (song: Song | Song[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  jumpToIndex: (index: number) => void;
  moveInQueue: (fromIndex: number, toIndex: number) => void;
  
  // Modos de reproducción
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  
  // Control de volumen
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // UI
  showQueue: boolean;
  toggleQueuePanel: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer debe usarse dentro de PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  // Estados principales
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [queue, setQueueState] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');
  const [volume, setVolumeState] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showQueue, setShowQueue] = useState(false);

  // Referencias
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousVolumeRef = useRef(70);
  const isSeekingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const desiredVolumeRef = useRef(70); // Track target volume for fades

  const STORAGE_KEY = 'zora_player_v1';

  // Inicializar elemento de audio
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    // Event listeners
    const handleLoadStart = () => {
      setPlayerState('loading');
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(0);
    };

    const handleCanPlay = () => {
      if (playerState === 'loading') {
        setPlayerState('paused');
      }
    };

    const handlePlaying = () => {
      setPlayerState('playing');
    };

    const handlePause = () => {
      if (playerState !== 'ended') {
        setPlayerState('paused');
      }
    };

    const handleEnded = () => {
      setPlayerState('ended');
      handleSongEnded();
    };

    const handleError = (e: Event) => {
      console.error('Error de audio:', e);
      setPlayerState('error');
    };

    const handleWaiting = () => {
      setPlayerState('buffering');
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        setBuffered((bufferedEnd / audio.duration) * 100 || 0);
      }
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('progress', handleProgress);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('progress', handleProgress);
      audio.pause();
      audio.src = '';
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  

  // Persistir estado
  useEffect(() => {
    try {
      const data = {
        queue,
        originalQueue,
        currentIndex,
        currentTime,
        volume,
        isMuted,
        repeatMode,
        isShuffled,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Silenciar errores de cuota/localStorage
    }
  }, [queue, originalQueue, currentIndex, currentTime, volume, isMuted, repeatMode, isShuffled]);

  // Manejar fin de canción
  const handleSongEnded = useCallback(() => {
    if (repeatMode === 'one') {
      // Repetir la canción actual
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.error('Error al repetir:', err));
      }
    } else if (repeatMode === 'all' && currentIndex === queue.length - 1) {
      // Volver al inicio de la cola
      jumpToIndex(0);
    } else if (currentIndex < queue.length - 1) {
      // Siguiente canción
      next();
    } else {
      // Fin de la cola sin repetición
      setPlayerState('ended');
    }
  }, [repeatMode, currentIndex, queue.length]);

  // Cargar nueva canción
  const loadSong = useCallback((song: Song) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    // Cargar nueva fuente
    if (audio.src !== song.audioUrl) {
      audio.src = song.audioUrl;
      audio.load();
    }
    
    setCurrentSong(song);
    setCurrentTime(0);
    setBuffered(0);
  }, []);

  // Restaurar estado desde localStorage (colocado tras loadSong)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);

      if (saved.volume !== undefined) {
        setVolumeState(saved.volume);
        desiredVolumeRef.current = saved.volume;
      }
      if (saved.isMuted !== undefined) setIsMuted(saved.isMuted);
      if (saved.repeatMode) setRepeatModeState(saved.repeatMode as RepeatMode);
      if (saved.isShuffled !== undefined) setIsShuffled(saved.isShuffled);
      if (Array.isArray(saved.queue) && saved.queue.length > 0) {
        setQueueState(saved.queue);
        setOriginalQueue(saved.originalQueue || saved.queue);
        const idx = typeof saved.currentIndex === 'number' ? saved.currentIndex : 0;
        setCurrentIndex(idx);
        if (saved.queue[idx]) {
          loadSong(saved.queue[idx]);
          if (audioRef.current && typeof saved.currentTime === 'number') {
            audioRef.current.currentTime = saved.currentTime;
            setCurrentTime(saved.currentTime);
          }
        }
      }
    } catch (e) {
      console.warn('No se pudo restaurar el estado del reproductor', e);
    }
  }, [loadSong]);

  // Animación para sincronización suave del tiempo
  const startRaf = useCallback(() => {
    if (rafIdRef.current) return;
    const tick = () => {
      if (audioRef.current && !isSeekingRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // Utilidad de fade para transiciones suaves
  const fadeTo = useCallback(async (target: number, durationMs: number = 150) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const start = audio.volume * 100;
    const end = Math.max(0, Math.min(100, target));
    const startTs = performance.now();
    return new Promise<void>((resolve) => {
      const step = (now: number) => {
        const t = Math.min(1, (now - startTs) / durationMs);
        const val = start + (end - start) * t;
        audio.volume = val / 100;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }, []);

  // Acciones de reproducción
  const play = useCallback(async () => {
    if (!audioRef.current || !currentSong) return;
    
    try {
      // Asegurar volumen deseado y arrancar rAF
      desiredVolumeRef.current = volume;
      audioRef.current.volume = (isMuted ? 0 : volume) / 100;
      startRaf();
      await audioRef.current.play();
      setPlayerState('playing');
    } catch (err) {
      console.error('Error al reproducir:', err);
      setPlayerState('error');
    }
  }, [currentSong, volume, isMuted, startRaf]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlayerState('paused');
    stopRaf();
  }, [stopRaf]);

  const togglePlayPause = useCallback(() => {
    if (playerState === 'playing') {
      pause();
    } else if (currentSong) {
      play();
    }
  }, [playerState, currentSong, play, pause]);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPlayerState('idle');
    setCurrentTime(0);
    stopRaf();
  }, [stopRaf]);

  // Seek y navegación básica
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    isSeekingRef.current = true;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    
    setTimeout(() => {
      isSeekingRef.current = false;
    }, 100);
  }, []);

  const skipForward = useCallback((seconds: number = 10) => {
    if (!audioRef.current) return;
    const newTime = Math.min(audioRef.current.currentTime + seconds, duration);
    seek(newTime);
  }, [duration, seek]);

  const skipBackward = useCallback((seconds: number = 10) => {
    if (!audioRef.current) return;
    const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
    seek(newTime);
  }, [seek]);

  // Jump to index - debe estar antes de next/previous
  const jumpToIndex = useCallback((index: number) => {
    if (index < 0 || index >= queue.length || !audioRef.current) return;
    
    const song = queue[index];
    const audio = audioRef.current;
    const wasPlaying = playerState === 'playing';
    
    setCurrentIndex(index);
    
    // Cargar nueva fuente
    if (audio.src !== song.audioUrl) {
      audio.src = song.audioUrl;
      audio.load();
    }
    
    setCurrentSong(song);
    setCurrentTime(0);
    setBuffered(0);
    
    if (wasPlaying) {
      // Reproducir automáticamente la nueva canción
      const handleCanPlay = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        play().catch(err => console.error('Error al saltar a canción:', err));
      };
      
      if (audio.readyState >= 3) {
        play().catch(err => console.error('Error al saltar a canción:', err));
      } else {
        audio.addEventListener('canplay', handleCanPlay, { once: true });
      }
    }
  }, [queue, playerState, play]);

  // Navegación next/previous
  const next = useCallback(() => {
    if (queue.length === 0) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      jumpToIndex(nextIndex);
    } else if (repeatMode === 'all') {
      jumpToIndex(0);
    }
  }, [currentIndex, queue.length, repeatMode, jumpToIndex]);

  const previous = useCallback(() => {
    if (queue.length === 0) return;
    
    // Si la canción lleva más de 3 segundos, reiniciarla
    if (currentTime > 3) {
      seek(0);
    } else {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        jumpToIndex(prevIndex);
      } else if (repeatMode === 'all') {
        jumpToIndex(queue.length - 1);
      }
    }
  }, [currentIndex, currentTime, queue.length, repeatMode, seek, jumpToIndex]);

  // Control de cola
  // clearQueue debe estar primero porque otras funciones lo usan
  const clearQueue = useCallback(() => {
    stop();
    setQueueState([]);
    setOriginalQueue([]);
    setCurrentIndex(0);
    setCurrentSong(null);
    setIsShuffled(false);
  }, [stop]);

  const setQueue = useCallback((songs: Song[], startIndex: number = 0, autoPlay: boolean = true) => {
    if (songs.length === 0) {
      clearQueue();
      return;
    }

    setQueueState(songs);
    setOriginalQueue(songs);
    setIsShuffled(false);
    setCurrentIndex(startIndex);
    
    const song = songs[startIndex];
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    // Cargar nueva fuente
    if (audio.src !== song.audioUrl) {
      audio.src = song.audioUrl;
      audio.load();
    }
    
    setCurrentSong(song);
    setCurrentTime(0);
    setBuffered(0);
    
    if (autoPlay) {
      // Esperar a que esté listo para reproducir
      const handleCanPlay = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        play().catch(err => console.error('Error al reproducir automáticamente:', err));
      };
      
      if (audio.readyState >= 3) {
        // Ya está listo
        play().catch(err => console.error('Error al reproducir automáticamente:', err));
      } else {
        audio.addEventListener('canplay', handleCanPlay, { once: true });
      }
    }
  }, [clearQueue, play]);

  const addToQueue = useCallback((songOrSongs: Song | Song[]) => {
    const songs = Array.isArray(songOrSongs) ? songOrSongs : [songOrSongs];
    
    setQueueState(prev => {
      const newQueue = [...prev, ...songs];
      if (isShuffled) {
        setOriginalQueue(newQueue);
      }
      return newQueue;
    });
  }, [isShuffled]);

  const removeFromQueue = useCallback((index: number) => {
    setQueueState(prev => {
      const newQueue = prev.filter((_, i) => i !== index);
      
      // Ajustar índice actual si es necesario
      if (index < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      } else if (index === currentIndex) {
        // Si quitamos la canción actual, cargar la siguiente
        if (newQueue.length > 0) {
          const newIndex = Math.min(currentIndex, newQueue.length - 1);
          setCurrentIndex(newIndex);
          jumpToIndex(newIndex);
        } else {
          clearQueue();
        }
      }
      
      if (isShuffled) {
        setOriginalQueue(newQueue);
      }
      
      return newQueue;
    });
  }, [currentIndex, isShuffled, jumpToIndex, clearQueue]);

  const moveInQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueueState(prev => {
      const newQueue = [...prev];
      const [movedSong] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedSong);
      
      // Ajustar currentIndex
      if (fromIndex === currentIndex) {
        setCurrentIndex(toIndex);
      } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
        setCurrentIndex(currentIndex - 1);
      } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
        setCurrentIndex(currentIndex + 1);
      }
      
      return newQueue;
    });
  }, [currentIndex]);

  // Shuffle
  const toggleShuffle = useCallback(() => {
    if (!isShuffled) {
      // Activar shuffle
      setOriginalQueue(queue);
      
      const currentSongInQueue = queue[currentIndex];
      const otherSongs = queue.filter((_, i) => i !== currentIndex);
      
      // Fisher-Yates shuffle
      for (let i = otherSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
      }
      
      // La canción actual siempre es la primera
      const shuffledQueue = [currentSongInQueue, ...otherSongs];
      setQueueState(shuffledQueue);
      setCurrentIndex(0);
      setIsShuffled(true);
    } else {
      // Desactivar shuffle
      const currentSongId = currentSong?.id;
      const restoredIndex = originalQueue.findIndex(s => s.id === currentSongId);
      
      setQueueState(originalQueue);
      setCurrentIndex(restoredIndex !== -1 ? restoredIndex : 0);
      setIsShuffled(false);
    }
  }, [isShuffled, queue, currentIndex, originalQueue, currentSong]);

  // Repeat
  const toggleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatModeState(nextMode);
  }, [repeatMode]);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatModeState(mode);
  }, []);

  // Volumen
  const setVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(100, vol));
    setVolumeState(clampedVolume);
    desiredVolumeRef.current = clampedVolume;
    audioRef.current.volume = (isMuted ? 0 : clampedVolume) / 100;
    
    if (clampedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      setVolume(previousVolumeRef.current);
      setIsMuted(false);
    } else {
      previousVolumeRef.current = volume;
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume, setVolume]);

  // UI
  const toggleQueuePanel = useCallback(() => {
    setShowQueue(prev => !prev);
  }, []);

  // Sincronizar volumen inicial
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (isMuted ? 0 : volume) / 100;
    }
  }, [volume, isMuted]);

  const value: PlayerContextType = {
    currentSong,
    playerState,
    queue,
    currentIndex,
    originalQueue,
    isShuffled,
    repeatMode,
    volume,
    isMuted,
    currentTime,
    duration,
    buffered,
    play,
    pause,
    togglePlayPause,
    stop,
    next,
    previous,
    seek,
    skipForward,
    skipBackward,
    setQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    jumpToIndex,
    moveInQueue,
    toggleShuffle,
    toggleRepeat,
    setRepeatMode,
    setVolume,
    toggleMute,
    showQueue,
    toggleQueuePanel,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

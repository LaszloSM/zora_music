import { useState, useEffect, useCallback, useRef } from 'react';
import './styles/app-animations.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MusicPlayer } from './components/MusicPlayer';
import { Component, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; errorMsg: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary atrapó un error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:'40px', color:'#fff', fontFamily:'sans-serif', background:'#0A1628', minHeight:'100vh'}}>
          <h1 style={{fontSize:'28px', marginBottom:'12px'}}>Ha ocurrido un error</h1>
          <p style={{opacity:.8, marginBottom:'20px'}}>Intenta recargar la página. Detalle: {this.state.errorMsg}</p>
          <button onClick={()=>location.reload()} style={{background:'#5BC0DE', color:'#042031', padding:'10px 18px', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer'}}>Recargar</button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { HomePage } from './components/HomePage';
import { SearchPage } from './components/SearchPage';
import { LibraryPage } from './components/LibraryPage';
import { ArtistDashboard } from './components/ArtistDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthPage } from './components/AuthPage';
import { PlaylistDetail } from './components/PlaylistDetail';
import { Song, Playlist } from './types';
import { useAuthStore } from './stores/auth';
import { songsAPI, playlistsAPI, favoritesAPI, historyAPI } from './lib/api';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { QueuePanel } from './components/QueuePanel';
import { Toast } from './components/Toast';
import HomeSkeleton from './components/loading/HomeSkeleton';

const LAST_PLAYBACK_STORAGE_PREFIX = 'zora_last_playback_v1_';

export default function App() {
  const authStore = useAuthStore();
  const { user: currentUser, isAuthenticated, logout } = authStore;
  const playbackStorageKey = currentUser ? `${LAST_PLAYBACK_STORAGE_PREFIX}${currentUser.id || currentUser.email}` : null;
  const [currentView, setCurrentView] = useState('home');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
  const [forceRender, setForceRender] = useState(0);
  const [playbackContext, setPlaybackContext] = useState<'single' | 'playlist'>('single');
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'info'} | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [resumePosition, setResumePosition] = useState<number | null>(null);
  const [hasRestoredPlayback, setHasRestoredPlayback] = useState(false);
  const lastPlaybackSnapshotRef = useRef<{ songId: string; position: number; isPlaying: boolean } | null>(null);

  // Cargar canciones y playlists del backend cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadSongs();
      loadPlaylists();
      loadFavorites();
    }
  }, [isAuthenticated]);

      <ErrorBoundary>
        <App />
      </ErrorBoundary>
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log('Usuario autenticado detectado:', currentUser);
      // Establecer la vista según el rol del usuario
      if (currentUser.role === 'admin') {
        setCurrentView('admin-dashboard');
      } else if (currentUser.role === 'artist') {
        setCurrentView('artist-dashboard');
      } else {
        setCurrentView('home');
      }
    }
  }, [isAuthenticated, currentUser]);

  const loadSongs = async () => {
    try {
      setIsLoadingSongs(true);
      const fetchedSongs = await songsAPI.getAll();
      setSongs(fetchedSongs);
    } catch (error) {
      console.error('Error cargando canciones:', error);
      setSongs([]);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  const loadPlaylists = async () => {
    try {
      setIsLoadingPlaylists(true);
      const fetchedPlaylists = await playlistsAPI.getAll();
      setPlaylists(fetchedPlaylists);
    } catch (error) {
      console.error('Error cargando playlists:', error);
      setPlaylists([]);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setIsLoadingFavorites(true);
      const fetchedFavorites = await favoritesAPI.getAll();
      setFavorites(fetchedFavorites);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      setFavorites([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const handleCreatePlaylist = async (name: string, isPublic: boolean) => {
    await playlistsAPI.create({ name, is_public: isPublic });
    await loadPlaylists();
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      await playlistsAPI.delete(playlistId);
      await loadPlaylists();
      showToast('Playlist eliminada', 'success');
      // Si estábamos viendo esta playlist, volver a biblioteca
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
        setCurrentView('library');
      }
    } catch (error) {
      console.error('Error eliminando playlist:', error);
      showToast('Error al eliminar playlist', 'error');
    }
  };

  const handleAddToPlaylist = async (playlistId: string, songId: string) => {
    try {
      await playlistsAPI.addSong(playlistId, songId);
      await loadPlaylists(); // Reload playlists to get updated song lists
      showToast('Canción agregada a la playlist', 'success');
    } catch (error) {
      console.error('Error agregando canción a playlist:', error);
      showToast('Error al agregar canción', 'error');
    }
  };

  const handleToggleFavorite = async (songId: string, isFavorite: boolean) => {
    try {
      // Actualizar estado local inmediatamente para feedback instantáneo
      const updateSongFavorite = (song: Song) => 
        song.id === songId ? { ...song, isFavorite: !isFavorite } : song;
      
      setSongs(prevSongs => prevSongs.map(updateSongFavorite));
      setQueue(prevQueue => prevQueue.map(updateSongFavorite));
      
      if (currentSong && currentSong.id === songId) {
        setCurrentSong({ ...currentSong, isFavorite: !isFavorite });
      }

      // Actualizar favoritos localmente
      if (isFavorite) {
        setFavorites(prevFavorites => prevFavorites.filter(f => f.id !== songId));
      } else {
        const songToAdd = songs.find(s => s.id === songId);
        if (songToAdd) {
          setFavorites(prevFavorites => [...prevFavorites, { ...songToAdd, isFavorite: true }]);
        }
      }

      // Hacer la petición al backend en segundo plano
      if (isFavorite) {
        await favoritesAPI.remove(songId);
        showToast('Canción quitada de favoritos', 'info');
      } else {
        await favoritesAPI.add(songId);
        showToast('Canción agregada a favoritos', 'success');
      }
    } catch (error) {
      console.error('Error con favorito:', error);
      showToast('Error al actualizar favorito', 'error');
      // Revertir cambios si falla
      const revertSongFavorite = (song: Song) => 
        song.id === songId ? { ...song, isFavorite: isFavorite } : song;
      
      setSongs(prevSongs => prevSongs.map(revertSongFavorite));
      setQueue(prevQueue => prevQueue.map(revertSongFavorite));
      
      if (currentSong && currentSong.id === songId) {
        setCurrentSong({ ...currentSong, isFavorite: isFavorite });
      }

      // Revertir favoritos
      if (isFavorite) {
        const songToAdd = songs.find(s => s.id === songId);
        if (songToAdd) {
          setFavorites(prevFavorites => [...prevFavorites, { ...songToAdd, isFavorite: true }]);
        }
      } else {
        setFavorites(prevFavorites => prevFavorites.filter(f => f.id !== songId));
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleQueueSongClick = (index: number) => {
    setCurrentQueueIndex(index);
    setCurrentSong(queue[index]);
    setIsPlaying(true);
  };

  const handleRemoveFromQueue = (index: number) => {
    const newQueue = queue.filter((_, i) => i !== index);
    setQueue(newQueue);
    if (index < currentQueueIndex) {
      setCurrentQueueIndex(currentQueueIndex - 1);
    } else if (index === currentQueueIndex) {
      setCurrentSong(newQueue[currentQueueIndex] || null);
    }
    showToast('Canción quitada de la cola', 'info');
  };

  const handleClearQueue = () => {
    setQueue([]);
    setOriginalQueue([]);
    setCurrentQueueIndex(0);
    setCurrentSong(null);
    setIsPlaying(false);
    showToast('Cola limpiada', 'info');
  };

  const handleAddToQueue = (song: Song) => {
    if (queue.length === 0) {
      // Si no hay cola, reproducir la canción directamente
      handlePlaySong(song, 'single');
      showToast('Reproduciendo canción', 'success');
    } else {
      // Agregar al final de la cola
      const newQueue = [...queue, song];
      setQueue(newQueue);
      setOriginalQueue([...originalQueue, song]);
      showToast(`"${song.title}" agregada a la cola`, 'success');
    }
  };

  const handleSearch = (query: string) => {
    setGlobalSearchQuery(query);
  };

  const handlePlaybackSnapshot = useCallback(
    ({ songId, currentTime, duration, isPlaying }: { songId: string; currentTime: number; duration: number; isPlaying: boolean }) => {
      if (!playbackStorageKey || !songId) {
        return;
      }

      const previous = lastPlaybackSnapshotRef.current;
      if (
        previous &&
        previous.songId === songId &&
        Math.abs(previous.position - currentTime) < 0.5 &&
        previous.isPlaying === isPlaying
      ) {
        return;
      }

      lastPlaybackSnapshotRef.current = { songId, position: currentTime, isPlaying };

      try {
        const queueSongIds = queue.map((song) => song.id);
        const snapshot = {
          songId,
          position: currentTime,
          duration,
          isPlaying,
          queueSongIds,
          currentQueueIndex,
          playbackContext,
          updatedAt: Date.now(),
        };
        localStorage.setItem(playbackStorageKey, JSON.stringify(snapshot));
      } catch (error) {
        console.warn('No se pudo guardar el estado de reproducción', error);
      }
    },
    [playbackStorageKey, queue, currentQueueIndex, playbackContext]
  );

  const handlePlaybackStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const handleResumeApplied = useCallback(() => {
    setResumePosition(null);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !playbackStorageKey || hasRestoredPlayback) {
      return;
    }

    if (isLoadingSongs || songs.length === 0) {
      return;
    }

    if (currentSong) {
      setHasRestoredPlayback(true);
      return;
    }

    try {
      const raw = localStorage.getItem(playbackStorageKey);
      if (!raw) {
        setHasRestoredPlayback(true);
        return;
      }

      const stored = JSON.parse(raw);
      if (!stored?.songId) {
        setHasRestoredPlayback(true);
        return;
      }

      const queueSongIds: string[] = Array.isArray(stored.queueSongIds) ? stored.queueSongIds : [];
      const restoredQueue = queueSongIds
        .map((id: string) => songs.find((song) => song.id === id))
        .filter((song): song is Song => Boolean(song));

      const fallbackSong = songs.find((song) => song.id === stored.songId);
      const effectiveQueue = restoredQueue.length
        ? restoredQueue
        : fallbackSong
        ? [fallbackSong]
        : [];

      if (!effectiveQueue.length) {
        setHasRestoredPlayback(true);
        return;
      }

      const index = restoredQueue.length
        ? Math.min(Math.max(0, stored.currentQueueIndex ?? 0), restoredQueue.length - 1)
        : 0;
      const activeSong = effectiveQueue[Math.min(index, effectiveQueue.length - 1)] ?? effectiveQueue[0];

      const storedDuration = typeof stored.duration === 'number' ? stored.duration : null;
      const normalizedQueue = storedDuration && storedDuration > 0
        ? effectiveQueue.map((song) =>
            song.id === activeSong.id && (!song.duration || song.duration <= 0)
              ? { ...song, duration: storedDuration }
              : song
          )
        : effectiveQueue;
      const normalizedActive = normalizedQueue.find((song) => song.id === activeSong.id) || activeSong;

      setQueue(normalizedQueue);
      setOriginalQueue(normalizedQueue);
      setCurrentQueueIndex(Math.min(index, normalizedQueue.length - 1));
      setCurrentSong(normalizedActive);
      setPlaybackContext(stored.playbackContext === 'playlist' ? 'playlist' : 'single');
      setIsPlaying(!!stored.isPlaying);

      const rawPosition = typeof stored.position === 'number' ? stored.position : 0;
      const durationCap = storedDuration && storedDuration > 0 ? storedDuration : normalizedActive.duration;
      const safePosition = durationCap && durationCap > 0 ? Math.max(0, Math.min(rawPosition, durationCap)) : Math.max(0, rawPosition);
      setResumePosition(safePosition);
    } catch (error) {
      console.warn('No se pudo restaurar el estado de reproducción', error);
    } finally {
      setHasRestoredPlayback(true);
    }
  }, [
    isAuthenticated,
    playbackStorageKey,
    hasRestoredPlayback,
    isLoadingSongs,
    songs,
    currentSong,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasRestoredPlayback(false);
      setResumePosition(null);
      lastPlaybackSnapshotRef.current = null;
    }
  }, [isAuthenticated]);

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'artist':
        return 'Artista';
      case 'listener':
        return 'Oyente';
      default:
        return role;
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    // Limpiar búsqueda cuando se sale de search o library
    if (view !== 'search' && view !== 'library') {
      setGlobalSearchQuery('');
    }
  };

  const handleLogin = async (role: 'listener' | 'artist' | 'admin') => {
    console.log('handleLogin llamado con rol:', role);
    
    // Actualizar la vista según el rol
    if (role === 'admin') {
      console.log('Redirigiendo a admin dashboard');
      setCurrentView('admin-dashboard');
    } else if (role === 'artist') {
      console.log('Redirigiendo a artist dashboard');
      setCurrentView('artist-dashboard');
    } else {
      console.log('Redirigiendo a home');
      setCurrentView('home');
    }
    
    // Forzar re-render inmediato
    setForceRender(prev => prev + 1);
    
    // Cargar canciones si no es admin
    if (role !== 'admin') {
      loadSongs();
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentView('home');
  };

  const handlePlaySong = (song: Song, context: 'single' | 'playlist' = 'single', contextSongs?: Song[]) => {
    console.log('handlePlaySong llamado', { 
      cancionSeleccionada: song.title, 
      context,
      contextSongs: contextSongs?.length || 0
    });
    setResumePosition(null);
    setCurrentSong(song);
    setIsPlaying(true);
    setPlaybackContext(context);
    
    // Registrar en historial
    if (isAuthenticated) {
      historyAPI.register(song.id).catch(err => 
        console.error('Error registrando reproducción:', err)
      );
    }
    
    if (context === 'playlist' && contextSongs && contextSongs.length > 0) {
      // Reproducir en contexto de playlist
      const newQueue = isShuffled ? shuffleArray([...contextSongs]) : [...contextSongs];
      setQueue(newQueue);
      setOriginalQueue([...contextSongs]);
      const songIndex = newQueue.findIndex(s => s.id === song.id);
      setCurrentQueueIndex(songIndex);
    } else {
      // Reproducir canción individual
      setQueue([song]);
      setOriginalQueue([song]);
      setCurrentQueueIndex(0);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    console.log('handleNext llamado', { 
      queue: queue.length, 
      currentIndex: currentQueueIndex,
      playbackContext 
    });
    
    if (queue.length === 0) {
      console.log('No hay canciones en la cola');
      return;
    }
    
    // Si estamos en modo single, no avanzar
    if (playbackContext === 'single' && queue.length === 1) {
      console.log('Modo single: reiniciando canción actual');
      setIsPlaying(false);
      setTimeout(() => {
        setCurrentSong({...queue[0]});
        setIsPlaying(true);
      }, 10);
      return;
    }
    
    let nextIndex = currentQueueIndex + 1;
    
    // Si llegamos al final de la cola
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all' || playbackContext === 'playlist') {
        nextIndex = 0; // Volver al inicio
      } else {
        // En modo single sin repeat, detener
        setIsPlaying(false);
        return;
      }
    }
    
    console.log('Cambiando a índice:', nextIndex, 'Canción:', queue[nextIndex]?.title);
    setCurrentQueueIndex(nextIndex);
    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    console.log('handlePrevious llamado', { 
      queue: queue.length, 
      currentIndex: currentQueueIndex,
      playbackContext 
    });
    
    if (queue.length === 0) return;
    
    // Si estamos en modo single, reiniciar la canción
    if (playbackContext === 'single' && queue.length === 1) {
      console.log('Modo single: reiniciando canción actual');
      setIsPlaying(false);
      setTimeout(() => {
        setCurrentSong({...queue[0]});
        setIsPlaying(true);
      }, 10);
      return;
    }
    
    const prevIndex = currentQueueIndex === 0 ? queue.length - 1 : currentQueueIndex - 1;
    console.log('Cambiando a índice:', prevIndex, 'Canción:', queue[prevIndex]?.title);
    
    setCurrentQueueIndex(prevIndex);
    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  };

  const handleShuffleToggle = () => {
    console.log('handleShuffleToggle llamado', { isShuffled, queue: queue.length });
    const newShuffleState = !isShuffled;
    setIsShuffled(newShuffleState);
    
    if (newShuffleState) {
      // Activar shuffle: mezclar la cola pero mantener la canción actual
      const currentSongId = currentSong?.id;
      const otherSongs = queue.filter(s => s.id !== currentSongId);
      const shuffledOthers = shuffleArray(otherSongs);
      const newQueue = currentSong ? [currentSong, ...shuffledOthers] : shuffledOthers;
      console.log('Shuffle activado, nueva cola:', newQueue.length);
      setQueue(newQueue);
      setCurrentQueueIndex(0);
    } else {
      // Desactivar shuffle: volver al orden original
      const currentSongId = currentSong?.id;
      setQueue(originalQueue);
      const newIndex = originalQueue.findIndex(s => s.id === currentSongId);
      console.log('Shuffle desactivado, volviendo a índice:', newIndex);
      setCurrentQueueIndex(newIndex >= 0 ? newIndex : 0);
    }
  };

  const handleRepeatToggle = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const newMode = modes[(currentIndex + 1) % modes.length];
    console.log('handleRepeatToggle llamado', { repeatMode, newMode });
    setRepeatMode(newMode);
  };

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentView('playlist-detail');
  };

  const handleBackFromPlaylist = () => {
    setSelectedPlaylist(null);
    setCurrentView('playlists');
  };

  // Usar forceRender para asegurar que React detecte cambios
  const shouldShowAuth = !isAuthenticated || !currentUser;
  
  console.log('Renderizando App:', { 
    isAuthenticated, 
    hasUser: !!currentUser, 
    shouldShowAuth,
    forceRender 
  });

  if (shouldShowAuth) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const isDashboardView = currentView === 'admin-dashboard' || currentView === 'artist-dashboard';

  return (
    <div
      className="relative h-screen flex flex-col text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1A2B42 50%, #0A1628 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -left-24 top-24 h-96 w-96 rounded-full opacity-60 blur-[80px]"
          style={{ background: 'rgba(74, 159, 184, 0.25)' }}
        />
        <div
          className="absolute -right-20 bottom-16 h-[22rem] w-[22rem] rounded-full opacity-60 blur-[90px]"
          style={{ background: 'rgba(91, 192, 222, 0.2)' }}
        />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          user={currentUser}
          onCreatePlaylistClick={() => setIsCreatePlaylistModalOpen(true)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            user={currentUser} 
            onLogout={handleLogout}
            onSearchClick={() => handleViewChange('search')}
            onSearch={handleSearch}
            onProfileClick={() => handleViewChange('profile')}
            onSettingsClick={() => handleViewChange('settings')}
          />
          
          <main 
            className="flex-1 overflow-y-auto"
            style={{ 
              padding: isDashboardView ? '0' : '0 24px',
              paddingBottom: '128px'
            }}
          >
            {currentView === 'home' && (
              isLoadingSongs || isLoadingPlaylists ? (
                <div className="py-10">
                  <HomeSkeleton />
                </div>
              ) : (
                <HomePage
                  songs={songs}
                  playlists={playlists}
                  onPlaySong={handlePlaySong}
                  onPlaylistClick={handlePlaylistClick}
                  onAddToPlaylist={handleAddToPlaylist}
                  onCreatePlaylist={() => setIsCreatePlaylistModalOpen(true)}
                  onAddToQueue={handleAddToQueue}
                  onToggleFavorite={handleToggleFavorite}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                />
              )
            )}
            
            {currentView === 'search' && (
              <SearchPage
                songs={songs}
                playlists={playlists}
                onPlaySong={handlePlaySong}
                onAddToPlaylist={handleAddToPlaylist}
                onCreatePlaylist={() => setIsCreatePlaylistModalOpen(true)}
                onAddToQueue={handleAddToQueue}
                onToggleFavorite={handleToggleFavorite}
                searchQuery={globalSearchQuery}
              />
            )}
            
            {currentView === 'library' && (
              <LibraryPage
                songs={songs}
                playlists={playlists}
                favorites={favorites}
                onPlaySong={handlePlaySong}
                onPlaylistClick={handlePlaylistClick}
                currentSong={currentSong}
                onAddToPlaylist={handleAddToPlaylist}
                onCreatePlaylist={() => setIsCreatePlaylistModalOpen(true)}
                onAddToQueue={handleAddToQueue}
                searchQuery={globalSearchQuery}
              />
            )}

            {currentView === 'playlist-detail' && selectedPlaylist && (
              <PlaylistDetail
                playlist={selectedPlaylist}
                allPlaylists={playlists}
                onPlaySong={handlePlaySong}
                onBack={handleBackFromPlaylist}
                currentSong={currentSong}
                onAddToPlaylist={handleAddToPlaylist}
                onCreatePlaylist={() => setIsCreatePlaylistModalOpen(true)}
                onAddToQueue={handleAddToQueue}
                onDeletePlaylist={handleDeletePlaylist}
              />
            )}
            
            {currentView === 'artist-dashboard' && currentUser.role === 'artist' && (
              <ArtistDashboard 
                songs={songs.filter(s => s.artistId === currentUser.id)} 
                onSongsUpdate={loadSongs}
              />
            )}
            
            {currentView === 'admin-dashboard' && currentUser.role === 'admin' && (
              <AdminDashboard songs={songs} />
            )}



            {currentView === 'settings' && (
              <div className="space-y-8 max-w-5xl mx-auto">
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6dd0f0] via-[#5bc0de] to-[#4a9fb8]">
                    Configuración
                  </h1>
                  <p className="text-[#a8c9e6]">Personaliza tu experiencia</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-[#102235]/85 border border-[#1d2f46]/60 rounded-2xl p-6 shadow-[0_18px_45px_rgba(10,30,52,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#5bc0de]/60 hover:shadow-[0_22px_55px_rgba(11,39,64,0.45)]">
                    <h3 className="mb-4 text-xl font-semibold text-white">Cuenta</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-[#a8c9e6]/80 uppercase tracking-wide">Nombre</span>
                        <span className="text-white font-semibold text-right">
                          {currentUser.nombres ? `${currentUser.nombres} ${currentUser.apellidos || ''}`.trim() : currentUser.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-[#a8c9e6]/80 uppercase tracking-wide">Email</span>
                        <span className="text-white font-semibold text-right">{currentUser.email}</span>
                      </div>
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-[#a8c9e6]/80 uppercase tracking-wide">Tipo de cuenta</span>
                        <span className="capitalize text-[#5bc0de] font-semibold">{currentUser.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#102235]/85 border border-[#1d2f46]/60 rounded-2xl p-6 shadow-[0_18px_45px_rgba(10,30,52,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#5bc0de]/60 hover:shadow-[0_22px_55px_rgba(11,39,64,0.45)]">
                    <h3 className="mb-4 text-xl font-semibold text-white">Preferencias</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col gap-2">
                        <span className="text-[#a8c9e6]/80 uppercase tracking-wide">Calidad de audio</span>
                        <select className="bg-[#0f1f33] border-2 border-[#1d2f46]/70 rounded-lg px-3 py-2 text-white focus:border-[#5bc0de] focus:ring-2 focus:ring-[#5bc0de]/40 outline-none transition-all duration-200 shadow-[0_10px_25px_rgba(9,26,43,0.45)]">
                          <option>Alta (320kbps)</option>
                          <option>Media (160kbps)</option>
                          <option>Baja (96kbps)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#a8c9e6]/80 uppercase tracking-wide">Reproducción automática</span>
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-md transition-transform duration-200"
                          style={{ accentColor: '#5bc0de' }}
                          defaultChecked
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'profile' && (
              <div className="space-y-10 max-w-6xl mx-auto">
                <div className="flex flex-wrap gap-6 items-center bg-[#102235]/85 border border-[#1d2f46]/60 rounded-2xl p-6 shadow-[0_18px_45px_rgba(10,30,52,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#5bc0de]/60 hover:shadow-[0_24px_55px_rgba(11,39,64,0.45)]">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] flex items-center justify-center text-4xl font-bold text-[#042031] shadow-2xl shadow-[#0b2740]/35">
                    {currentUser.nombres ? currentUser.nombres.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <h1 className="text-3xl font-bold text-white mb-1">
                      {currentUser.nombres ? `${currentUser.nombres} ${currentUser.apellidos || ''}`.trim() : currentUser.email}
                    </h1>
                    <p className="text-[#a8c9e6] text-sm">{getRoleLabel(currentUser.role)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 min-w-[220px]">
                    <div className="bg-[#0f1f33] rounded-xl p-4 border border-[#1d2f46]/50 shadow-[0_12px_30px_rgba(10,30,52,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-[#5bc0de]/50">
                      <p className="text-[#a8c9e6]/80 text-xs uppercase tracking-wide">Email</p>
                      <p className="text-white font-semibold truncate mt-1">{currentUser.email}</p>
                    </div>
                    <div className="bg-[#0f1f33] rounded-xl p-4 border border-[#1d2f46]/50 shadow-[0_12px_30px_rgba(10,30,52,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-[#5bc0de]/50">
                      <p className="text-[#a8c9e6]/80 text-xs uppercase tracking-wide">Tipo de cuenta</p>
                      <p className="text-[#5bc0de] font-semibold mt-1">{getRoleLabel(currentUser.role)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-[#102235]/85 border border-[#1d2f46]/60 rounded-2xl p-6 shadow-[0_18px_45px_rgba(10,30,52,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#5bc0de]/60 hover:shadow-[0_24px_55px_rgba(11,39,64,0.45)]">
                    <h2 className="text-xl font-semibold text-white mb-4">Actividad reciente</h2>
                    <p className="text-[#a8c9e6] text-sm">
                      Tus últimas reproducciones y playlists aparecerán aquí próximamente.
                    </p>
                  </div>
                  <div className="bg-[#102235]/85 border border-[#1d2f46]/60 rounded-2xl p-6 shadow-[0_18px_45px_rgba(10,30,52,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#5bc0de]/60 hover:shadow-[0_24px_55px_rgba(11,39,64,0.45)]">
                    <h2 className="text-xl font-semibold text-white mb-4">Preferencias rápidas</h2>
                    <p className="text-[#a8c9e6] text-sm">
                      Gestiona tus preferencias desde el apartado de configuración.
                    </p>
                    <button
                      onClick={() => handleViewChange('settings')}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] text-[#042031] font-medium shadow-lg shadow-[#0b2740]/35 transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_18px_35px_rgba(11,39,64,0.45)]"
                    >
                      Abrir Configuración
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isShuffled={isShuffled}
        onShuffleToggle={handleShuffleToggle}
        repeatMode={repeatMode}
        onRepeatToggle={handleRepeatToggle}
        onToggleFavorite={handleToggleFavorite}
        onShowQueue={() => setShowQueue(!showQueue)}
        resumeFrom={resumePosition}
        onResumeApplied={handleResumeApplied}
        onPlaybackSnapshot={handlePlaybackSnapshot}
        onPlaybackStateChange={handlePlaybackStateChange}
      />

      {showQueue && (
        <QueuePanel
          queue={queue}
          currentIndex={currentQueueIndex}
          onClose={() => setShowQueue(false)}
          onSongClick={handleQueueSongClick}
          onRemove={handleRemoveFromQueue}
          onClear={handleClearQueue}
        />
      )}

      <CreatePlaylistModal
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => setIsCreatePlaylistModalOpen(false)}
        onCreate={handleCreatePlaylist}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

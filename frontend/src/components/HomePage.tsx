import { SongCard } from './SongCard';
import { PlaylistCard } from './PlaylistCard';
import { Song, Playlist } from '../types';
import { Sparkles, TrendingUp, Clock, Album } from 'lucide-react';

interface HomePageProps {
  songs: Song[];
  playlists: Playlist[];
  onPlaySong: (song: Song, context?: 'single' | 'playlist', contextSongs?: Song[]) => void;
  onPlaylistClick: (playlist: Playlist) => void;
  onAddToPlaylist?: (playlistId: string, songId: string) => Promise<void>;
  onCreatePlaylist?: () => void;
  onAddToQueue?: (song: Song) => void;
  onToggleFavorite?: (songId: string, isFavorite: boolean) => void;
  currentSong?: Song | null;
  isPlaying?: boolean;
}

export function HomePage({ songs, playlists, onPlaySong, onPlaylistClick, onAddToPlaylist, onCreatePlaylist, onAddToQueue, onToggleFavorite, currentSong, isPlaying }: HomePageProps) {
  const topSongs = [...songs].sort((a, b) => b.plays - a.plays).slice(0, 6);
  const recentSongs = [...songs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-80 rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(10,30,52,0.35)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1752830457847-97ac95b93a07?w=1200)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#061425] via-[#061425]/80 to-transparent" />
        </div>
        <div className="relative h-full flex flex-col justify-end p-8">
          <div className="flex items-center gap-2 text-[#6dd0f0] mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold">Destacado</span>
          </div>
          <h1 className="text-5xl mb-4 font-bold">Descubre nueva música</h1>
          <p className="text-[#a8c9e6] text-lg max-w-2xl">
            Explora millones de canciones de artistas de todo el mundo
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => topSongs[0] && onPlaySong(topSongs[0])}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#042031] shadow-lg shadow-[#0b2740]/30 bg-gradient-to-r from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] transition-all duration-200 hover:shadow-[0_16px_40px_rgba(11,39,64,0.4)] hover:scale-[1.02]"
            >
              Escuchar ahora
            </button>
            <button
              type="button"
              onClick={() => onCreatePlaylist?.()}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold border border-[#5bc0de]/70 text-[#a8c9e6] bg-[#0f1f33]/70 backdrop-blur-md transition-all duration-200 hover:text-white hover:border-[#6dd0f0] hover:bg-[#132a44]/80"
            >
              Crear playlist
            </button>
          </div>
        </div>
      </div>

      {/* Top Songs */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-[#5bc0de]" />
          <h2 className="text-2xl font-bold text-white">Más Populares</h2>
        </div>
        {topSongs.length > 0 ? (
          <div className="space-y-1">
            {topSongs.map((song, index) => (
              <SongCard 
                key={song.id} 
                song={song} 
                onPlay={onPlaySong} 
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
                onCreatePlaylist={onCreatePlaylist}
                onAddToQueue={onAddToQueue}
                onToggleFavorite={onToggleFavorite}
                currentSong={currentSong}
                isPlaying={isPlaying}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-[#1d2f46]/70 bg-[#102235]/80 px-6 py-8 text-[#a8c9e6] shadow-[0_16px_40px_rgba(10,30,52,0.3)]">
            <TrendingUp className="w-8 h-8 text-[#5bc0de]" />
            <div>
              <h3 className="text-lg font-semibold text-white">Aún no hay canciones populares</h3>
              <p className="text-sm">Cuando tengas reproducciones aparecerán aquí automáticamente.</p>
            </div>
          </div>
        )}
      </section>

      {/* Playlists */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Album className="w-6 h-6 text-[#5bc0de]" />
          <h2 className="text-2xl font-bold text-white">Playlists Destacadas</h2>
        </div>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} onClick={onPlaylistClick} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-[#1d2f46]/70 bg-[#102235]/80 px-6 py-8 text-[#a8c9e6] shadow-[0_16px_40px_rgba(10,30,52,0.3)]">
            <Album className="w-8 h-8 text-[#5bc0de]" />
            <div>
              <h3 className="text-lg font-semibold text-white">Todavía no has creado playlists</h3>
              <p className="text-sm">Crea una playlist para guardar tus canciones favoritas.</p>
            </div>
          </div>
        )}
      </section>

      {/* Recent */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-[#5bc0de]" />
          <h2 className="text-2xl font-bold text-white">Lanzamientos Recientes</h2>
        </div>
        {recentSongs.length > 0 ? (
          <div className="space-y-1">
            {recentSongs.map((song, index) => (
              <SongCard 
                key={song.id} 
                song={song} 
                onPlay={onPlaySong}
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
                onCreatePlaylist={onCreatePlaylist}
                onAddToQueue={onAddToQueue}
                onToggleFavorite={onToggleFavorite}
                currentSong={currentSong}
                isPlaying={isPlaying}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-[#1d2f46]/70 bg-[#102235]/80 px-6 py-8 text-[#a8c9e6] shadow-[0_16px_40px_rgba(10,30,52,0.3)]">
            <Clock className="w-8 h-8 text-[#5bc0de]" />
            <div>
              <h3 className="text-lg font-semibold text-white">Sin lanzamientos recientes</h3>
              <p className="text-sm">Sube nueva música para mantener a tu audiencia al día.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

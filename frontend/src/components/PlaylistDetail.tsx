import { useState } from 'react';
import { Play, Heart, Clock, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { SongRow } from './SongRow';
import { Playlist, Song } from '../types';
import { PlaylistCoverCollage } from './PlaylistCoverCollage';

interface PlaylistDetailProps {
  playlist: Playlist;
  allPlaylists: Playlist[];
  onPlaySong: (song: Song, context?: 'single' | 'playlist', contextSongs?: Song[]) => void;
  onBack: () => void;
  currentSong: Song | null;
  onAddToPlaylist?: (playlistId: string, songId: string) => Promise<void>;
  onCreatePlaylist?: () => void;
  onEditPlaylist?: () => void;
  onRemoveSong?: (songId: string) => void;
  onAddToQueue?: (song: Song) => void;
  onDeletePlaylist?: (playlistId: string) => Promise<void>;
}

export function PlaylistDetail({ playlist, allPlaylists, onPlaySong, onBack, currentSong, onAddToPlaylist, onCreatePlaylist, onEditPlaylist, onAddToQueue, onDeletePlaylist }: PlaylistDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const totalDuration = playlist.songs.reduce((sum, song) => sum + song.duration, 0);
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="-ml-2 text-[#a8c9e6] hover:text-white hover:bg-[#132a44]/50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      <div className="flex gap-6 items-end">
        <PlaylistCoverCollage
          coverUrls={playlist.songs.map(s => s.coverUrl)}
          alt={playlist.name}
          className="w-48 h-48 rounded-lg shadow-2xl shadow-[#0b2740]/40"
        />
        <div className="flex-1">
          <p className="text-sm tracking-[0.35em] text-[#5bc0de] font-semibold mb-2">PLAYLIST</p>
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-[0_6px_20px_rgba(74,159,184,0.35)]">{playlist.name}</h1>
          <p className="text-[#a8c9e6]/80 mb-4 max-w-2xl">{playlist.description}</p>
          <div className="flex items-center gap-2 text-sm text-[#a8c9e6]/80">
            <span>{playlist.songs.length} canciones</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => playlist.songs[0] && onPlaySong(playlist.songs[0], 'playlist', playlist.songs)}
          className="bg-gradient-to-br from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] hover:shadow-lg hover:shadow-[#0b2740]/40 text-[#042031] rounded-full w-14 h-14 transition-all"
        >
          <Play className="w-6 h-6 fill-current" />
        </Button>
        <Button variant="ghost" size="icon" className="text-[#a8c9e6] hover:text-white hover:bg-[#132a44]/50 transition-colors">
          <Heart className="w-6 h-6" />
        </Button>
        {onEditPlaylist && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#a8c9e6] hover:text-white hover:bg-[#132a44]/50 transition-colors"
            onClick={onEditPlaylist}
          >
            <Edit className="w-6 h-6" />
          </Button>
        )}
        {onDeletePlaylist && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#a8c9e6] hover:text-red-300 hover:bg-red-500/15 transition-colors"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[#031222]/90 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-[#0f1f33] border border-[#1d3654]/60 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-[#0b2740]/40" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-white">¿Eliminar playlist?</h3>
            <p className="text-[#a8c9e6]/80 mb-6">
              ¿Estás seguro de que quieres eliminar la playlist "{playlist.name}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                className="text-[#a8c9e6] hover:text-white hover:bg-[#132a44]/50"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:shadow-lg hover:shadow-red-900/30 text-white"
                onClick={async () => {
                  if (onDeletePlaylist) {
                    await onDeletePlaylist(playlist.id);
                    setShowDeleteConfirm(false);
                  }
                }}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#0f1f33]/70 rounded-xl border border-[#1d2f46]/60 overflow-hidden shadow-lg shadow-[#0b2740]/20">
        <div className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-4 px-4 py-3 border-b border-[#1d2f46]/60 text-sm text-[#a8c9e6]/70 uppercase tracking-widest">
          <div className="w-8 text-center">#</div>
          <div>Título</div>
          <div>Álbum</div>
          <div><Clock className="w-4 h-4" /></div>
          <div className="w-20"></div>
        </div>
        <div className="divide-y divide-[#1d2f46]/60">
          {playlist.songs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              onPlay={(song) => onPlaySong(song, 'playlist', playlist.songs)}
              isPlaying={currentSong?.id === song.id}
              playlists={allPlaylists}
              onAddToPlaylist={onAddToPlaylist}
              onCreatePlaylist={onCreatePlaylist}
              onAddToQueue={onAddToQueue}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

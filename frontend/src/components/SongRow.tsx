import { Play, Heart, MoreVertical } from 'lucide-react';
import { Song, Playlist } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SongActionsMenu } from './SongActionsMenu';

interface SongRowProps {
  song: Song;
  index: number;
  onPlay: (song: Song) => void;
  isPlaying?: boolean;
  playlists?: Playlist[];
  onAddToPlaylist?: (playlistId: string, songId: string) => Promise<void>;
  onCreatePlaylist?: () => void;
  onAddToQueue?: (song: Song) => void;
  onToggleFavorite?: (songId: string, isFavorite: boolean) => void;
}

export function SongRow({ 
  song, 
  index, 
  onPlay, 
  isPlaying = false,
  playlists = [],
  onAddToPlaylist,
  onCreatePlaylist,
  onAddToQueue,
  onToggleFavorite
}: SongRowProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={() => onPlay(song)}
      className={`group grid grid-cols-[auto,1fr,1fr,auto,auto] gap-4 items-center px-4 py-2 rounded-lg transition-colors cursor-pointer hover:bg-[#132a44]/60 border border-transparent hover:border-[#1d2f46]/60 ${
        isPlaying ? 'bg-[#4a9fb8]/15 border-[#1d2f46]/60' : ''
      }`}
    >
      <div className="w-8 text-center">
        <span className="group-hover:hidden text-[#a8c9e6]/70">{index + 1}</span>
        <Play className="w-4 h-4 hidden group-hover:block text-white fill-current" />
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <ImageWithFallback
          src={song.coverUrl}
          alt={song.title}
          className="w-10 h-10 rounded object-cover"
        />
        <div className="min-w-0">
          <h4 className={`truncate font-medium ${isPlaying ? 'text-[#5bc0de]' : 'text-white'}`}>
            {song.title}
          </h4>
          <p className="text-sm text-[#a8c9e6]/80 truncate">{song.artistName}</p>
        </div>
      </div>

      <div className="text-sm text-[#a8c9e6]/80 truncate">{song.albumName || 'Single'}</div>

      <div className="text-sm text-[#a8c9e6]/80">{formatDuration(song.duration)}</div>

      <div className={`flex items-center gap-2 transition-opacity ${song.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(song.id, song.isFavorite || false);
          }}
          className={`transition-colors ${
            song.isFavorite
              ? 'text-[#5bc0de] drop-shadow-[0_0_10px_rgba(91,192,222,0.45)]'
              : 'text-[#a8c9e6]/70 hover:text-[#5bc0de]'
          }`}
        >
          <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-current' : ''}`} />
        </button>
        {onAddToPlaylist && onCreatePlaylist && (
          <SongActionsMenu
            song={song}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
            onCreatePlaylist={onCreatePlaylist}
            onAddToQueue={onAddToQueue}
            trigger={
              <button className="text-[#a8c9e6]/70 hover:text-white transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}

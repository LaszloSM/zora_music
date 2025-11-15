import { Play, Pause, MoreVertical, Heart } from 'lucide-react';
import { Song, Playlist } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SongActionsMenu } from './SongActionsMenu';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  playlists?: Playlist[];
  onAddToPlaylist?: (playlistId: string, songId: string) => Promise<void>;
  onCreatePlaylist?: () => void;
  onAddToQueue?: (song: Song) => void;
  onToggleFavorite?: (songId: string, isFavorite: boolean) => void;
  currentSong?: Song | null;
  isPlaying?: boolean;
  index?: number;
  showArtist?: boolean;
}

export function SongCard({ 
  song, 
  onPlay,
  playlists = [],
  onAddToPlaylist,
  onCreatePlaylist,
  onAddToQueue,
  onToggleFavorite,
  currentSong,
  isPlaying = false,
  index,
  showArtist = true
}: SongCardProps) {
  const isCurrentSong = currentSong?.id === song.id;
  const isPlayingThis = isCurrentSong && isPlaying;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    onPlay(song);
  };

  return (
    <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-[#0f1f33]/50 transition-all">
      {/* Index/Play button */}
      <div className="w-8 flex-shrink-0 text-center">
        {isPlayingThis ? (
          <button onClick={handlePlayPause}>
            <Pause className="w-4 h-4 text-[#5bc0de]" fill="currentColor" />
          </button>
        ) : (
          <>
            <span className="group-hover:hidden text-[#a8c9e6]/50">{index !== undefined ? index + 1 : ''}</span>
            <button onClick={handlePlayPause} className="hidden group-hover:block">
              <Play className="w-4 h-4 text-white" fill="currentColor" />
            </button>
          </>
        )}
      </div>

      {/* Cover & Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <ImageWithFallback
            src={song.coverUrl}
            alt={song.title}
            className="w-12 h-12 rounded shadow-lg"
          />
          {isPlayingThis && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
              <div className="w-1 h-4 bg-[#5bc0de] animate-pulse" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`truncate ${isCurrentSong ? 'text-[#5bc0de]' : 'text-white'}`}>
            {song.title}
          </div>
          {showArtist && (
            <div className="text-sm text-[#a8c9e6]/70 truncate">{song.artistName}</div>
          )}
        </div>
      </div>

      {/* Album */}
      <div className="hidden md:block w-48 flex-shrink-0 truncate text-sm text-[#a8c9e6]/70">
        {song.albumName || 'Single'}
      </div>

      {/* Plays */}
      <div className="hidden lg:block w-16 flex-shrink-0 text-sm text-[#a8c9e6]/50 text-right">
        {formatNumber(song.plays)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button 
          className={`transition-opacity p-2 hover:bg-[#0f1f33] rounded-full ${song.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(song.id, song.isFavorite || false);
          }}
        >
          <Heart className={`w-4 h-4 transition-colors ${song.isFavorite ? 'text-[#5bc0de] fill-current drop-shadow-[0_0_10px_rgba(91,192,222,0.45)]' : 'text-[#a8c9e6]/60 hover:text-[#5bc0de]'}`} />
        </button>

        <div className="w-12 text-sm text-[#a8c9e6]/50 text-right">
          {formatDuration(song.duration)}
        </div>

        {onAddToPlaylist && onCreatePlaylist && (
          <SongActionsMenu
            song={song}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
            onCreatePlaylist={onCreatePlaylist}
            onAddToQueue={onAddToQueue}
            trigger={(
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#0f1f33] rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4 text-[#a8c9e6]/60" />
              </button>
            )}
          />
        )}
      </div>
    </div>
  );
}

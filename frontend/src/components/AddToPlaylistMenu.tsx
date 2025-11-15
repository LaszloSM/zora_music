import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Playlist, Song } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AddToPlaylistMenuProps {
  song: Song;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  onCreatePlaylist: () => void;
  trigger: React.ReactNode;
}

export function AddToPlaylistMenu({ 
  song, 
  playlists, 
  onAddToPlaylist, 
  onCreatePlaylist,
  trigger 
}: AddToPlaylistMenuProps) {
  const [addingTo, setAddingTo] = useState<string | null>(null);

  const handleAddToPlaylist = async (playlistId: string) => {
    setAddingTo(playlistId);
    try {
      await onAddToPlaylist(playlistId, song.id);
    } finally {
      setAddingTo(null);
    }
  };

  const isSongInPlaylist = (playlist: Playlist) => {
    return playlist.songs.some(s => s.id === song.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <DropdownMenuLabel>Agregar a playlist</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onCreatePlaylist();
          }}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span>Nueva playlist</span>
        </DropdownMenuItem>
        
        {playlists.length > 0 && <DropdownMenuSeparator />}
        
        {playlists.map((playlist) => {
          const isInPlaylist = isSongInPlaylist(playlist);
          const isAdding = addingTo === playlist.id;
          
          return (
            <DropdownMenuItem
              key={playlist.id}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (!isInPlaylist && !isAdding) {
                  handleAddToPlaylist(playlist.id);
                }
              }}
              disabled={isInPlaylist || isAdding}
              className="cursor-pointer"
            >
              {isInPlaylist ? (
                <Check className="w-4 h-4 mr-2 text-[#5BC0DE]" />
              ) : isAdding ? (
                <span className="w-4 h-4 mr-2 animate-spin">⏳</span>
              ) : (
                <span className="w-4 h-4 mr-2" />
              )}
              <span className={isInPlaylist ? 'text-[#5BC0DE]' : ''}>
                {playlist.name}
              </span>
            </DropdownMenuItem>
          );
        })}
        
        {playlists.length === 0 && (
          <DropdownMenuItem disabled>
            <span className="text-sm text-[#B8D4E8]/60">No tienes playlists</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

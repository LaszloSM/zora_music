import { ListPlus, Plus, Check, Music2 } from 'lucide-react';
import { Playlist, Song } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface SongActionsMenuProps {
  song: Song;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  onCreatePlaylist: () => void;
  onAddToQueue?: (song: Song) => void;
  trigger: React.ReactNode;
}

export function SongActionsMenu({ 
  song, 
  playlists, 
  onAddToPlaylist, 
  onCreatePlaylist,
  onAddToQueue,
  trigger 
}: SongActionsMenuProps) {
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
        sideOffset={8}
        className="w-64 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          background: 'linear-gradient(135deg, #1A2B42 0%, #0F1E30 100%)',
          borderColor: '#5BC0DE',
          borderWidth: '2px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 15px rgba(91, 192, 222, 0.3)'
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {onAddToQueue && (
          <>
            <DropdownMenuItem
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onAddToQueue(song);
              }}
              className="cursor-pointer px-4 py-3 rounded-lg mx-2 mt-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-transparent"
              style={{ 
                color: '#FFFFFF',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.backgroundColor = 'rgba(91, 192, 222, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(91, 192, 222, 0.3)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <ListPlus className="w-4 h-4 mr-3 text-[#5BC0DE]" />
              <span className="font-medium">Agregar a la cola</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator 
              className="my-2 mx-2" 
              style={{ backgroundColor: 'rgba(74, 159, 184, 0.3)' }}
            />
          </>
        )}
        
        <DropdownMenuLabel 
          className="px-4 py-2 font-bold text-xs uppercase tracking-wider"
          style={{ color: '#5BC0DE' }}
        >
          <Music2 className="w-3 h-3 inline mr-2" />
          Agregar a playlist
        </DropdownMenuLabel>
        
        <div className="max-h-48 overflow-y-auto px-2">
          {playlists.length > 0 ? (
            <>
              {playlists.map((playlist) => {
                const isInPlaylist = isSongInPlaylist(playlist);
                return (
                  <DropdownMenuItem
                    key={playlist.id}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (!isInPlaylist) {
                        onAddToPlaylist(playlist.id, song.id);
                      }
                    }}
                    disabled={isInPlaylist}
                    className={`px-4 py-3 rounded-lg mx-1 my-0.5 transition-all duration-200 border border-transparent ${
                      isInPlaylist 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    style={{ 
                      color: '#FFFFFF',
                      backgroundColor: isInPlaylist ? 'rgba(74, 159, 184, 0.1)' : 'transparent'
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      if (!isInPlaylist) {
                        e.currentTarget.style.backgroundColor = 'rgba(91, 192, 222, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(91, 192, 222, 0.3)';
                      }
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      if (!isInPlaylist) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center min-w-0">
                        {isInPlaylist ? (
                          <Check className="w-4 h-4 mr-3 text-[#5BC0DE] flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 mr-3 flex-shrink-0" />
                        )}
                        <span className="truncate font-medium">{playlist.name}</span>
                      </div>
                      {isInPlaylist && (
                        <span className="text-xs text-[#5BC0DE] ml-2 flex-shrink-0">✓ Agregada</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </>
          ) : (
            <div className="px-4 py-4 text-sm text-center rounded-lg mx-2 my-1" style={{ 
              color: 'rgba(184, 212, 232, 0.6)',
              backgroundColor: 'rgba(15, 30, 48, 0.5)'
            }}>
              <Music2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="italic">No tienes playlists aún</p>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator 
          className="my-2 mx-2" 
          style={{ backgroundColor: 'rgba(74, 159, 184, 0.3)' }}
        />
        
        <DropdownMenuItem
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onCreatePlaylist();
          }}
          className="cursor-pointer px-4 py-3 rounded-lg mx-2 mb-2 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-transparent"
          style={{ 
            color: '#5BC0DE',
            backgroundColor: 'rgba(91, 192, 222, 0.1)'
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.backgroundColor = 'rgba(91, 192, 222, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(91, 192, 222, 0.4)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.backgroundColor = 'rgba(91, 192, 222, 0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <Plus className="w-4 h-4 mr-3" />
          <span>Crear nueva playlist</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

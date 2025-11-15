import { useState } from 'react';
import { Filter } from 'lucide-react';
import { SongCard } from './SongCard';
import { Badge } from './ui/badge';
import { Song, Playlist } from '../types';

interface SearchPageProps {
  songs: Song[];
  playlists?: Playlist[];
  onPlaySong: (song: Song, context?: 'single' | 'playlist', contextSongs?: Song[]) => void;
  onAddToPlaylist?: (playlistId: string, songId: string) => Promise<void>;
  onCreatePlaylist?: () => void;
  onAddToQueue?: (song: Song) => void;
  onToggleFavorite?: (songId: string, isFavorite: boolean) => void;
  searchQuery?: string;
}

export function SearchPage({ songs, playlists = [], onPlaySong, onAddToPlaylist, onCreatePlaylist, onAddToQueue, onToggleFavorite, searchQuery = '' }: SearchPageProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genres = Array.from(new Set(songs.map(s => s.genre)));

  const filteredSongs = songs.filter(song => {
    const matchesSearch = searchQuery === '' || 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.albumName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = !selectedGenre || song.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl mb-2 font-bold text-white">Buscar</h1>
        <p className="text-[#a8c9e6]">Encuentra tus canciones favoritas</p>
      </div>

      {/* Genre Filters */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-[#5bc0de]" />
          <span className="text-sm text-[#a8c9e6]">Filtrar por género:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedGenre === null ? 'default' : 'outline'}
            className={`cursor-pointer transition-all duration-200 ${
              selectedGenre === null
                ? 'bg-gradient-to-r from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] text-[#042031] font-semibold border-0 shadow-lg shadow-[#0b2740]/30'
                : 'border-[#2c5f7d] text-[#a8c9e6] hover:text-white hover:border-[#5bc0de] hover:bg-[#132a44]/50'
            }`}
            onClick={() => setSelectedGenre(null)}
          >
            Todos
          </Badge>
          {genres.map((genre) => (
            <Badge
              key={genre}
              variant={selectedGenre === genre ? 'default' : 'outline'}
              className={`cursor-pointer transition-all duration-200 ${
                selectedGenre === genre
                  ? 'bg-gradient-to-r from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] text-[#042031] font-semibold border-0 shadow-lg shadow-[#0b2740]/30'
                  : 'border-[#2c5f7d] text-[#a8c9e6] hover:text-white hover:border-[#5bc0de] hover:bg-[#132a44]/50'
              }`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <h2 className="text-xl mb-4 text-white">
          {searchQuery || selectedGenre
            ? `${filteredSongs.length} ${filteredSongs.length === 1 ? 'resultado' : 'resultados'}`
            : 'Explora la música'}
        </h2>
        {filteredSongs.length > 0 ? (
          <div className="space-y-1">
            {filteredSongs.map((song, index) => (
              <SongCard 
                key={song.id} 
                song={song} 
                onPlay={onPlaySong}
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
                onCreatePlaylist={onCreatePlaylist}
                onAddToQueue={onAddToQueue}
                onToggleFavorite={onToggleFavorite}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[#a8c9e6]">
            <Filter className="w-16 h-16 mb-4 text-[#5bc0de]" />
            <p className="text-white/70">No se encontraron canciones</p>
            <p className="text-sm mt-2">Intenta con otra búsqueda o cambia los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}

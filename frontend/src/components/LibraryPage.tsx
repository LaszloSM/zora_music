import { useState, useMemo } from 'react';
import { Music, User as UserIcon, Disc3, Play, Sparkles } from 'lucide-react';
import { LibraryFilters, FilterType, SortType, ViewType } from './LibraryFilters';
import { Song, Playlist } from '../types';

interface LibraryPageProps {
  songs: Song[];
  playlists: Playlist[];
  favorites: Song[];
  onPlaySong: (song: Song, context?: 'single' | 'playlist', contextSongs?: Song[]) => void;
  onPlaylistClick: (playlist: Playlist) => void;
  currentSong: Song | null;
  onAddToPlaylist?: (playlistId: string, songId: string) => Promise<void>;
  onCreatePlaylist?: () => void;
  onAddToQueue?: (song: Song) => void;
  searchQuery?: string;
}

export function LibraryPage({
  songs,
  playlists,
  favorites,
  onPlaySong,
  onPlaylistClick,
  onCreatePlaylist,
  searchQuery = '',
}: LibraryPageProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [viewType, setViewType] = useState<ViewType>('grid');

  // Obtener artistas y álbumes únicos SOLO de las canciones favoritas
  const artists = useMemo(() => Array.from(new Set(favorites.map((s) => s.artistName))), [favorites]);
  const albums = useMemo(
    () => Array.from(new Set(favorites.map((s) => s.albumName || 'Single'))),
    [favorites]
  );

  // Filtrar playlists basado en búsqueda
  const filteredPlaylists = useMemo(() => {
    return playlists.filter((playlist) => {
      if (!searchQuery) return true;
      return (
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [playlists, searchQuery]);

  // Filtrar y ordenar los datos
  const filteredAndSortedItems = useMemo(() => {
    let items: any[] = [];

    if (activeFilter === 'all') {
      // En "Todo" mostrar: playlists del usuario, canciones favoritas, álbumes de favoritos, artistas de favoritos
      items = [
        ...filteredPlaylists.map((p) => ({ type: 'playlist', data: p })),
        ...favorites.map((s) => ({ type: 'song', data: s })),
        ...albums.map((a) => ({ 
          type: 'album', 
          data: a,
          favoriteOnly: favorites.filter((s) => (s.albumName || 'Single') === a)
        })),
        ...artists.map((a) => ({ 
          type: 'artist', 
          data: a,
          favoriteOnly: favorites.filter((s) => s.artistName === a)
        })),
      ];
    } else if (activeFilter === 'playlists') {
      items = filteredPlaylists.map((p) => ({ type: 'playlist', data: p }));
    } else if (activeFilter === 'albums') {
      items = albums.map((a) => ({ 
        type: 'album', 
        data: a,
        favoriteOnly: favorites.filter((s) => (s.albumName || 'Single') === a)
      }));
    } else if (activeFilter === 'artists') {
      items = artists.map((a) => ({ 
        type: 'artist', 
        data: a,
        favoriteOnly: favorites.filter((s) => s.artistName === a)
      }));
    } else if (activeFilter === 'favorites') {
      items = favorites.map((s) => ({ type: 'song', data: s }));
    }

    // Ordenar
    if (sortBy === 'alphabetical') {
      items.sort((a, b) => {
        const nameA = a.type === 'playlist' ? a.data.name : a.data;
        const nameB = b.type === 'playlist' ? b.data.name : b.data;
        return nameA.localeCompare(nameB);
      });
    } else {
      // Por recientes - las playlists tienen createdAt
      items.sort((a, b) => {
        if (a.type === 'playlist' && b.type === 'playlist') {
          return b.data.createdAt.getTime() - a.data.createdAt.getTime();
        }
        return 0;
      });
    }

    return items;
  }, [activeFilter, sortBy, filteredPlaylists, albums, artists, favorites]);

  const handleItemClick = (item: any) => {
    if (item.type === 'playlist') {
      onPlaylistClick(item.data);
    } else if (item.type === 'album') {
      // Usar solo canciones favoritas para álbumes
      const albumSongs = favorites.filter((s) => (s.albumName || 'Single') === item.data);
      if (albumSongs.length > 0) {
        onPlaySong(albumSongs[0], 'playlist', albumSongs);
      }
    } else if (item.type === 'artist') {
      // Usar solo canciones favoritas para artistas
      const artistSongs = favorites.filter((s) => s.artistName === item.data);
      if (artistSongs.length > 0) {
        onPlaySong(artistSongs[0], 'playlist', artistSongs);
      }
    } else if (item.type === 'song') {
      // Para favoritos, reproducir la canción individual
      onPlaySong(item.data, 'single');
    }
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Music className="w-8 h-8 text-[#5bc0de]" />
          <h1 className="text-4xl font-bold text-white">Tu Biblioteca</h1>
        </div>
        <p className="text-[#a8c9e6]">
          Tus playlists, álbumes y artistas favoritos en un solo lugar
        </p>
      </div>

      <LibraryFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewType={viewType}
        onViewTypeChange={setViewType}
      />

      <div
        className={
          viewType === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4'
            : 'space-y-2'
        }
      >
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map((item, index) => (
            <ItemCard
              key={`${item.type}-${index}`}
              item={item}
              viewType={viewType}
              onClick={() => handleItemClick(item)}
              songs={songs}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-[#a8c9e6]">
            <Sparkles className="w-16 h-16 mb-4 text-[#5bc0de]" />
            <p className="text-white/70">No hay items en esta categoría</p>
            {activeFilter === 'playlists' && onCreatePlaylist && (
              <button
                onClick={onCreatePlaylist}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] text-[#042031] rounded-full font-semibold hover:shadow-lg hover:shadow-[#0b2740]/30 transition-all"
              >
                Crear Playlist
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para renderizar cada item
function ItemCard({
  item,
  viewType,
  onClick,
  songs,
}: {
  item: any;
  viewType: ViewType;
  onClick: () => void;
  songs: Song[];
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getItemInfo = () => {
    if (item.type === 'playlist') {
      const coverUrls = item.data.songs.slice(0, 4).map((s: Song) => s.coverUrl);
      return {
        title: item.data.name,
        subtitle: `Playlist • ${item.data.songs.length} canciones`,
        coverUrl: item.data.songs[0]?.coverUrl || 'https://via.placeholder.com/300',
        coverUrls,
        icon: <Music className="w-4 h-4" />,
        isRound: false,
        isPlaylist: true,
      };
    }

    if (item.type === 'album') {
      // Usar solo canciones favoritas para contar
      const albumSongs = item.favoriteOnly ? item.favoriteOnly : songs.filter((s) => (s.albumName || 'Single') === item.data);
      const albumSong = albumSongs[0];
      return {
        title: item.data,
        subtitle: `Álbum • ${albumSongs.length} ${albumSongs.length === 1 ? 'canción' : 'canciones'}`,
        coverUrl: albumSong?.coverUrl || 'https://via.placeholder.com/300',
        icon: <Disc3 className="w-4 h-4" />,
        isRound: false,
        isPlaylist: false,
      };
    }

    if (item.type === 'artist') {
      // Usar solo canciones favoritas para contar
      const artistSongs = item.favoriteOnly ? item.favoriteOnly : songs.filter((s) => s.artistName === item.data);
      const artistSong = artistSongs[0];
      return {
        title: item.data,
        subtitle: `Artista • ${artistSongs.length} ${artistSongs.length === 1 ? 'canción' : 'canciones'}`,
        coverUrl: artistSong?.coverUrl || 'https://via.placeholder.com/300',
        icon: <UserIcon className="w-4 h-4" />,
        isRound: true,
        isPlaylist: false,
      };
    }

    // Para canciones (favoritos)
    return {
      title: item.data.title,
      subtitle: `${item.data.artistName} • ${item.data.albumName || 'Single'}`,
      coverUrl: item.data.coverUrl || 'https://via.placeholder.com/300',
      icon: <Music className="w-4 h-4" />,
      isRound: false,
      isPlaylist: false,
    };
  };

  const info = getItemInfo();

  if (viewType === 'list') {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex items-center gap-4 p-3 rounded-lg cursor-pointer bg-[#0f1f33]/70 hover:bg-[#132a44]/80 transition-all duration-300 border border-[#1d2f46]/50"
      >
        <div className="relative flex-shrink-0">
          <div
            className={`w-14 h-14 ${
              info.isRound ? 'rounded-full' : 'rounded-md'
            } overflow-hidden bg-[#132a44]`}
          >
            <img src={info.coverUrl} alt={info.title} className="w-full h-full object-cover" />
          </div>
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white truncate font-semibold group-hover:text-[#5bc0de] transition-colors">{info.title}</h3>
          <div className="flex items-center gap-2 text-[#a8c9e6]/80 text-sm">
            {info.icon}
            <span className="truncate">{info.subtitle}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer p-4 rounded-xl bg-[#0f1f33]/70 hover:bg-[#132a44] transition-all duration-300 border border-[#1d2f46]/60"
    >
      <div className="relative mb-4">
        <div
          className={`w-full aspect-square ${
            info.isRound ? 'rounded-full' : 'rounded-lg'
          } overflow-hidden bg-[#132a44] shadow-lg`}
        >
          {info.isPlaylist && info.coverUrls && info.coverUrls.length >= 4 ? (
            <div className="grid grid-cols-2 gap-0 w-full h-full">
              {info.coverUrls.map((url: string, i: number) => (
                <img key={i} src={url} alt="" className="w-full h-full object-cover" />
              ))}
            </div>
          ) : (
            <img src={info.coverUrl} alt={info.title} className="w-full h-full object-cover" />
          )}
        </div>

        {/* Botón de play al hacer hover */}
        {isHovered && (
          <div className="absolute bottom-2 right-2 transition-all duration-300">
            <button className="bg-gradient-to-r from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] p-3 rounded-full shadow-2xl text-[#042031] hover:shadow-[#0b2740]/40 hover:scale-110 transition-all">
              <Play className="w-5 h-5 fill-current" />
            </button>
          </div>
        )}

        {/* Efecto de brillo en hover */}
        {isHovered && (
          <div
            className={`absolute inset-0 ${
              info.isRound ? 'rounded-full' : 'rounded-lg'
            } bg-gradient-to-t from-[#4a9fb8]/25 to-transparent transition-opacity duration-300`}
          />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-white truncate font-semibold group-hover:text-[#5bc0de] transition-all">
          {info.title}
        </h3>
        <div className="flex items-center gap-2 text-[#a8c9e6]/80 text-sm">
          {info.icon}
          <span className="truncate">{info.subtitle}</span>
        </div>
      </div>
    </div>
  );
}

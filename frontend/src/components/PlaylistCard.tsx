import { Play } from 'lucide-react';
import { Playlist } from '../types';
import { PlaylistCoverCollage } from './PlaylistCoverCollage';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: (playlist: Playlist) => void;
}

export function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  // Obtener las portadas de las canciones para el collage
  const coverUrls = playlist.songs.map(song => song.coverUrl);
  return (
    <div
      onClick={() => onClick(playlist)}
      className="group relative bg-[#0f1f33] p-4 rounded-xl hover:bg-[#132a44] transition-all duration-300 cursor-pointer border border-[#1d2f46]/70 hover:border-[#5bc0de] hover:shadow-xl hover:shadow-[#0b2740]/30"
    >
      <div className="relative mb-4 overflow-hidden rounded-lg shadow-xl">
        <PlaylistCoverCollage
          coverUrls={coverUrls}
          alt={playlist.name}
          className="w-full aspect-square transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <button className="absolute bottom-2 right-2 bg-gradient-to-br from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] text-[#042031] rounded-full p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 shadow-xl shadow-[#0b2740]/40">
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </button>
      </div>
      <h3 className="text-white truncate mb-2 font-bold text-base">{playlist.name}</h3>
      <p className="text-sm text-[#a8c9e6] truncate line-clamp-2">
        {playlist.description || `${playlist.songs.length} canciones`}
      </p>
    </div>
  );
}

import { Music } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PlaylistCoverCollageProps {
  coverUrls: string[];
  alt: string;
  className?: string;
}

export function PlaylistCoverCollage({ coverUrls, alt, className = '' }: PlaylistCoverCollageProps) {
  const validCovers = coverUrls.filter(url => url && url !== 'https://via.placeholder.com/300').slice(0, 4);
  
  // Si no hay covers, mostrar icono de música
  if (validCovers.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center ${className}`}>
        <Music className="w-1/3 h-1/3 text-white/30" />
      </div>
    );
  }

  // Si solo hay 1 cover
  if (validCovers.length === 1) {
    return (
      <ImageWithFallback
        src={validCovers[0]}
        alt={alt}
        className={className}
      />
    );
  }

  // Si hay 2, 3 o 4 covers, hacer collage
  return (
    <div className={`grid ${validCovers.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'} gap-0.5 ${className} overflow-hidden`}>
      {validCovers.slice(0, 4).map((url, index) => (
        <ImageWithFallback
          key={index}
          src={url}
          alt={`${alt} - ${index + 1}`}
          className="w-full h-full object-cover"
        />
      ))}
    </div>
  );
}

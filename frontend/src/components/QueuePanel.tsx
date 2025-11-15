import { X, Music, GripVertical } from 'lucide-react';
import { Song } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface QueuePanelProps {
  queue: Song[];
  currentIndex: number;
  onClose: () => void;
  onSongClick: (index: number) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}

export function QueuePanel({
  queue,
  currentIndex,
  onClose,
  onSongClick,
  onRemove,
  onClear
}: QueuePanelProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed right-0 top-0 bottom-0 w-96 z-40 shadow-2xl"
      style={{
        backgroundColor: '#0A1628',
        backdropFilter: 'blur(20px)',
        borderLeft: '2px solid rgba(74, 159, 184, 0.4)'
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{
            borderBottom: '1px solid rgba(74, 159, 184, 0.3)',
            backgroundColor: '#0F1E30'
          }}
        >
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[#5BC0DE]" />
            <h2 className="text-lg font-bold text-white">Cola de reproducción</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#B8D4E8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Queue info */}
        <div 
          className="px-4 py-3"
          style={{
            borderBottom: '1px solid rgba(74, 159, 184, 0.2)',
            backgroundColor: 'rgba(15, 30, 48, 0.6)'
          }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#B8D4E8]">
              {queue.length} {queue.length === 1 ? 'canción' : 'canciones'}
            </span>
            {queue.length > 0 && (
              <button
                onClick={onClear}
                className="text-[#4A9FB8] hover:text-[#5BC0DE] transition-colors font-medium"
              >
                Limpiar cola
              </button>
            )}
          </div>
        </div>

        {/* Queue list */}
        <div className="flex-1 overflow-y-auto">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Music className="w-16 h-16 text-[#4A9FB8]/30 mb-4" />
              <p className="text-[#B8D4E8] mb-2">Cola vacía</p>
              <p className="text-sm text-[#B8D4E8]/60">
                Las canciones que reproduzcas aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#4A9FB8]/10">
              {queue.map((song, index) => (
                <div
                  key={`${song.id}-${index}`}
                  className={`group flex items-center gap-3 p-3 hover:bg-[#132a44]/60 transition-colors cursor-pointer ${
                    index === currentIndex ? 'bg-[#4A9FB8]/15' : ''
                  }`}
                  onClick={() => onSongClick(index)}
                >
                  <div className="flex-shrink-0">
                    <GripVertical className="w-4 h-4 text-[#B8D4E8]/40" />
                  </div>
                  
                  <div className="flex-shrink-0">
                    <ImageWithFallback
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`truncate text-sm font-medium ${
                      index === currentIndex ? 'text-[#5BC0DE]' : 'text-white'
                    }`}>
                      {song.title}
                    </h4>
                    <p className="text-xs text-[#B8D4E8]/80 truncate">
                      {song.artistName}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-xs text-[#B8D4E8]/60">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[#B8D4E8]/60 hover:text-red-400 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

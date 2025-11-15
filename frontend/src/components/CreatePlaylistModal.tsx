import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, isPublic: boolean) => Promise<void>;
}

export function CreatePlaylistModal({ isOpen, onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onCreate(name.trim(), isPublic);
      setName('');
      setIsPublic(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear playlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setIsPublic(false);
      setError('');
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" 
      style={{ backgroundColor: 'rgba(10, 22, 40, 0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="bg-gradient-to-br from-[#1A2B42] to-[#0F1E30] border-2 border-[#5BC0DE] rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300"
        style={{ 
          backgroundColor: '#1A2B42', 
          borderColor: '#5BC0DE', 
          borderWidth: '2px',
          boxShadow: '0 25px 50px -12px rgba(91, 192, 222, 0.25), 0 0 0 1px rgba(91, 192, 222, 0.1)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b border-[#5BC0DE]/30"
          style={{ 
            background: 'linear-gradient(135deg, rgba(74, 159, 184, 0.1) 0%, rgba(91, 192, 222, 0.05) 100%)',
            borderBottomColor: 'rgba(91, 192, 222, 0.3)'
          }}
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-[#B8D4E8] bg-clip-text text-transparent">Crear Playlist</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-[#B8D4E8] hover:text-white hover:bg-[#5BC0DE]/10 transition-all duration-200 disabled:opacity-50 rounded-lg p-2 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label 
              htmlFor="playlist-name" 
              className="block mb-3 text-sm font-semibold text-[#B8D4E8]"
            >
              Nombre de la playlist
            </label>
            <input
              id="playlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi nueva playlist"
              disabled={isLoading}
              className="w-full px-4 py-3.5 bg-[#0A1628]/60 border border-[#2C5F7D]/60 rounded-lg focus:border-[#5BC0DE] focus:ring-2 focus:ring-[#5BC0DE]/20 focus:outline-none text-white placeholder:text-[#B8D4E8]/40 transition-all duration-200 disabled:opacity-50 hover:border-[#4A9FB8]/60"
              style={{ 
                backgroundColor: 'rgba(10, 22, 40, 0.6)', 
                borderColor: 'rgba(44, 95, 125, 0.6)', 
                color: '#FFFFFF'
              }}
              maxLength={100}
            />
          </div>

          <div 
            className="flex items-center gap-4 p-4 bg-[#0A1628]/40 rounded-lg border border-[#2C5F7D]/40 hover:border-[#5BC0DE]/60 hover:bg-[#5BC0DE]/5 transition-all duration-200 cursor-pointer group"
            style={{ backgroundColor: 'rgba(10, 22, 40, 0.4)', borderColor: 'rgba(44, 95, 125, 0.4)' }}
            onClick={() => !isLoading && setIsPublic(!isPublic)}
          >
            <input
              id="playlist-public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isLoading}
              className="w-5 h-5 accent-[#5BC0DE] rounded cursor-pointer disabled:opacity-50 transition-transform group-hover:scale-110"
              style={{ accentColor: '#5BC0DE' }}
            />
            <label 
              htmlFor="playlist-public" 
              className="text-sm text-[#B8D4E8] group-hover:text-white font-medium cursor-pointer select-none transition-colors duration-200"
            >
              Hacer pública esta playlist
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              variant="ghost"
              className="flex-1 border border-[#2C5F7D]/60 hover:border-[#5BC0DE] hover:bg-[#5BC0DE]/10 text-white disabled:opacity-50 font-semibold h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ borderColor: 'rgba(44, 95, 125, 0.6)', color: '#FFFFFF' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 bg-gradient-to-r from-[#4A9FB8] to-[#5BC0DE] hover:from-[#5BC0DE] hover:to-[#6DD0F0] text-white font-bold transition-all duration-200 shadow-lg shadow-[#5BC0DE]/30 hover:shadow-xl hover:shadow-[#5BC0DE]/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed h-12"
              style={{ 
                background: 'linear-gradient(135deg, #4A9FB8 0%, #5BC0DE 100%)', 
                color: '#FFFFFF'
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>✨</span>
                  Crear Playlist
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

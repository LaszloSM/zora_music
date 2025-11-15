import { useState } from 'react';
import { X } from 'lucide-react';
import { Playlist } from '../types';

interface EditPlaylistModalProps {
  isOpen: boolean;
  playlist: Playlist;
  onClose: () => void;
  onUpdate: (id: string, name: string, isPublic: boolean) => void;
  onDelete: (id: string) => void;
}

export function EditPlaylistModal({ isOpen, playlist, onClose, onUpdate, onDelete }: EditPlaylistModalProps) {
  const [name, setName] = useState(playlist.name);
  const [isPublic, setIsPublic] = useState(playlist.isPublic);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdate(playlist.id, name, isPublic);
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(playlist.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-[#0A1628] rounded-2xl shadow-2xl w-full max-w-md border-2 border-[#4A9FB8]/50 shadow-[#4A9FB8]/30 overflow-hidden"
        style={{
          backgroundColor: '#0A1628',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#4A9FB8]/30">
          <h2 className="text-2xl font-bold text-white">Editar Playlist</h2>
          <button
            onClick={onClose}
            className="text-[#B8D4E8] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-[#B8D4E8]">
              Nombre de la playlist
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mis favoritas"
              className="w-full px-4 py-3 rounded-lg bg-[#0F1E30] border-2 border-[#2C5F7D] text-white placeholder:text-[#B8D4E8]/50 focus:border-[#4A9FB8] focus:outline-none focus:ring-2 focus:ring-[#4A9FB8]/30 transition-all"
              required
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#0F1E30] rounded-lg border border-[#2C5F7D]">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 rounded accent-[#4A9FB8] cursor-pointer"
            />
            <label htmlFor="isPublic" className="text-[#B8D4E8] cursor-pointer select-none">
              Hacer pública esta playlist
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all duration-300 font-semibold"
            >
              Eliminar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#4A9FB8] to-[#5BC0DE] hover:from-[#5BC0DE] hover:to-[#6DD0F0] text-white font-semibold transition-all duration-300 shadow-lg shadow-[#4A9FB8]/30 hover:shadow-xl hover:shadow-[#5BC0DE]/40"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div
            className="bg-[#0A1628] rounded-2xl shadow-2xl w-full max-w-sm p-6 border-2 border-red-500/50"
            style={{
              backgroundColor: '#0A1628',
            }}
          >
            <h3 className="text-xl font-bold text-white mb-4">¿Eliminar playlist?</h3>
            <p className="text-[#B8D4E8] mb-6">
              Esta acción no se puede deshacer. Se eliminará "{playlist.name}" y todas sus canciones.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-[#4A9FB8]/50 text-[#B8D4E8] hover:bg-[#4A9FB8]/10 transition-all duration-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-300"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Home, Library, Plus, User, BarChart3 } from 'lucide-react';
import { User as UserType } from '../types';
import logoUrl from '../assets/logo.png';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: UserType;
  onCreatePlaylistClick?: () => void;
}

export function Sidebar({ currentView, onViewChange, user, onCreatePlaylistClick }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'library', label: 'Tu Biblioteca', icon: Library },
  ];

  const artistItems = user.role === 'artist' ? [
    { id: 'artist-dashboard', label: 'Panel de Artista', icon: User },
  ] : [];

  const adminItems = user.role === 'admin' ? [
    { id: 'admin-dashboard', label: 'Administración', icon: BarChart3 },
  ] : [];

  return (
    <div className="w-64 bg-gradient-to-b from-[#0b1b2f] via-[#0d223a] to-[#091424] border-r border-[#1d2f46] flex flex-col h-screen shadow-lg shadow-[#0b2740]/30">
      <div className="p-6 pb-4">
        <img src={logoUrl} alt="Zora" className="h-20 mb-2 drop-shadow-[0_18px_35px_rgba(20,50,80,0.35)]" />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium backdrop-blur-xs ${
              currentView === item.id
                ? 'bg-gradient-to-r from-[#1f3a52] via-[#2c5f7d] to-[#4a9fb8] text-white shadow-[0_14px_40px_rgba(74,159,184,0.35)] scale-[1.01]'
                : 'text-[#b8d4e8] hover:text-white hover:bg-[#132a44]/80 hover:shadow-[0_10px_30px_rgba(19,58,84,0.25)]'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Botón Crear Playlist */}
        <button
          onClick={() => onCreatePlaylistClick?.()}
          className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg text-[#042031] transition-all duration-200 font-semibold bg-gradient-to-r from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] shadow-[0_16px_40px_rgba(11,39,64,0.35)] hover:shadow-[0_18px_48px_rgba(11,39,64,0.45)] hover:scale-[1.01]"
        >
          <Plus className="w-5 h-5" />
          <span>Crear Playlist</span>
        </button>

        {artistItems.length > 0 && (
          <div className="pt-6">
            <h3 className="px-3 mb-2 text-xs text-[#6caad6] uppercase tracking-wider font-semibold">
              Artista
            </h3>
            {artistItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium backdrop-blur-xs ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-[#1f3a52] via-[#2c5f7d] to-[#4a9fb8] text-white shadow-[0_14px_40px_rgba(74,159,184,0.35)] scale-[1.01]'
                    : 'text-[#b8d4e8] hover:text-white hover:bg-[#132a44]/80 hover:shadow-[0_10px_30px_rgba(19,58,84,0.25)]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {adminItems.length > 0 && (
          <div className="pt-6">
            <h3 className="px-3 mb-2 text-xs text-[#6caad6] uppercase tracking-wider font-semibold">
              Admin
            </h3>
            {adminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium backdrop-blur-xs ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-[#1f3a52] via-[#2c5f7d] to-[#4a9fb8] text-white shadow-[0_14px_40px_rgba(74,159,184,0.35)] scale-[1.01]'
                    : 'text-[#b8d4e8] hover:text-white hover:bg-[#132a44]/80 hover:shadow-[0_10px_30px_rgba(19,58,84,0.25)]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}

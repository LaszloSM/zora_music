import { Search, Bell, LogOut, ChevronDown, Settings } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User } from '../types';
import logoUrl from '../assets/logo.svg';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onSearch?: (query: string) => void;
  onSearchClick?: () => void;
  onSettingsClick?: () => void;
}

export function Header({ user, onLogout, onSearch, onSearchClick, onSettingsClick }: HeaderProps) {
  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'artist':
        return 'Artista';
      case 'listener':
        return 'Oyente';
      default:
        return role;
    }
  };

  return (
        <header className="h-16 border-b border-[#1d2f46]/70 bg-[#0a1628]/95 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 shadow-lg shadow-[#0b2740]/20">
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex items-center gap-2">
          <img src={logoUrl} alt="Zora" className="h-10 w-auto drop-shadow-[0_12px_25px_rgba(20,50,80,0.35)]" />
          <span className="text-white font-bold text-lg tracking-wide">Zora Music</span>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8c9e6]" />
          <Input
            type="search"
            placeholder="Buscar canciones, artistas, álbumes..."
            className="pl-10 bg-[#11243a]/70 border border-[#1d2f46] focus:border-[#4a9fb8] text-white placeholder:text-[#a8c9e6]/60 focus:ring-2 focus:ring-[#4a9fb8]/40"
            onClick={onSearchClick}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-[#a8c9e6] hover:text-white hover:bg-[#132a44]/60 transition-all duration-200 hover:scale-105">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#5bc0de] rounded-full shadow-lg shadow-[#5bc0de]/50"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Button variant="ghost" className="flex items-center gap-2 py-2 px-3 hover:bg-[#132a44]/60 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4a9fb8] via-[#5bc0de] to-[#6dd0f0] flex items-center justify-center shadow-lg shadow-[#0b2740]/40">
                <span className="text-sm font-bold text-white">
                  {(() => {
                    const displayName = user.role === 'artist' && user.nombre_artistico 
                      ? user.nombre_artistico 
                      : (user.nombres || user.username || user.email);
                    return displayName.charAt(0).toUpperCase();
                  })()}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-white">
                  {user.role === 'artist' && user.nombre_artistico 
                    ? user.nombre_artistico 
                    : (user.nombres ? `${user.nombres} ${user.apellidos || ''}`.trim() : user.username || user.email)}
                </div>
                <div className="text-xs text-[#a8c9e6]">{getRoleLabel(user.role)}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#a8c9e6]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-64 rounded-xl border border-[#2c5f7d]/40 bg-[#0f1e30]/95 p-3 shadow-2xl shadow-[#0b2740]/30 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-lg"
          >
            <DropdownMenuLabel 
              className="px-4 py-3.5 bg-gradient-to-r from-[#142a42] to-[#1f3b55] rounded-lg mb-3 border border-[#2c5f7d]/40 shadow-[0_12px_28px_rgba(20,50,80,0.25)]"
            >
              <div className="text-sm font-bold text-white">
                {user.role === 'artist' && user.nombre_artistico 
                  ? user.nombre_artistico 
                  : (user.nombres ? `${user.nombres} ${user.apellidos || ''}`.trim() : user.username || user.email)}
              </div>
              <div className="text-xs text-[#5bc0de] mt-1 font-semibold">{getRoleLabel(user.role)}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1d2f46]/70 my-2" />
            <DropdownMenuItem 
              onClick={() => onSettingsClick?.()}
              className="px-4 py-3 text-white font-medium hover:text-white focus:text-white hover:bg-[#132a44]/70 focus:bg-[#132a44]/70 hover:border-[#2c5f7d]/40 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-transparent"
            >
              <Settings className="w-4 h-4 mr-3" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1d2f46]/70 my-2.5" />
            <DropdownMenuItem 
              onClick={onLogout}
              className="px-4 py-3 text-[#fda4b5] font-semibold hover:text-white hover:bg-[#3a1524]/70 hover:border-[#fb7185]/40 focus:bg-[#3a1524]/70 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-transparent"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

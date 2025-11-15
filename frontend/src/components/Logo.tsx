import { Music } from 'lucide-react';

interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { container: 'w-6 h-6', icon: 'w-3 h-3', text: 'text-base' },
    md: { container: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-xl' },
    lg: { container: 'w-12 h-12', icon: 'w-7 h-7', text: 'text-2xl' }
  };

  const sizeClass = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {/* Puedes reemplazar esto con: <img src="/logo.svg" alt="Zora Music" className={sizeClass.container} /> */}
      <div className={`${sizeClass.container} rounded-full bg-gradient-to-br from-[#5bc0de] to-[#9b59b6] flex items-center justify-center`}>
        <Music className={`${sizeClass.icon} text-white`} />
      </div>
      {showText && (
        <span className={`${sizeClass.text} font-bold bg-gradient-to-r from-[#5bc0de] to-[#9b59b6] bg-clip-text text-transparent`}>
          Zora Music
        </span>
      )}
    </div>
  );
}
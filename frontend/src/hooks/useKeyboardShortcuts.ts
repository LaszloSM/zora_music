import { useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';

export function useKeyboardShortcuts() {
  const {
    togglePlayPause,
    next,
    previous,
    skipForward,
    skipBackward,
    setVolume,
    volume,
    toggleMute,
  } = usePlayer();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar si está escribiendo en un input o textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Prevenir comportamiento por defecto solo para las teclas que usamos
      const shouldPreventDefault = ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code);

      switch (e.code) {
        case 'Space':
          if (shouldPreventDefault) e.preventDefault();
          togglePlayPause();
          break;

        case 'ArrowRight':
          if (shouldPreventDefault) e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            next();
          } else {
            skipForward(10);
          }
          break;

        case 'ArrowLeft':
          if (shouldPreventDefault) e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            previous();
          } else {
            skipBackward(10);
          }
          break;

        case 'ArrowUp':
          if (shouldPreventDefault) e.preventDefault();
          setVolume(Math.min(100, volume + 5));
          break;

        case 'ArrowDown':
          if (shouldPreventDefault) e.preventDefault();
          setVolume(Math.max(0, volume - 5));
          break;

        case 'KeyM':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleMute();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [togglePlayPause, next, previous, skipForward, skipBackward, setVolume, volume, toggleMute]);
}

import { colors } from './colors';

export const components = {
  card: {
    base: 'bg-secondary-800/80 border border-primary-700/30 backdrop-blur-sm rounded-lg overflow-hidden',
    header: 'p-6 border-b border-primary-700/20',
    title: 'text-lg font-semibold text-white',
    description: 'text-sm text-primary-100',
    content: 'p-6',
  },
  button: {
    base: 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
    ghost: 'hover:bg-secondary-700/50 text-secondary-100',
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    },
  },
  input: {
    base: 'block w-full rounded-md bg-secondary-700/50 border-secondary-600 focus:border-primary-500 focus:ring focus:ring-primary-500/20',
  },
  badge: {
    base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    colors: {
      primary: 'bg-primary-500/10 text-primary-400 border border-primary-500/30',
      secondary: 'bg-secondary-500/10 text-secondary-400 border border-secondary-500/30',
      success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      danger: 'bg-red-500/10 text-red-400 border border-red-500/30',
    },
  },
};
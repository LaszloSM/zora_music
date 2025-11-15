
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
// Usar hoja mínima de Tailwind para evitar conflicto con CSS ya compilado
import './tailwind.css';

createRoot(document.getElementById('root')!).render(<App />);
  
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clear any stale Service Worker / PWA caches from older builds so phones always render the latest UI
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const reg of registrations) {
        reg.update().catch(() => {});
      }
    })
    .catch(() => {});
}

createRoot(document.getElementById('root')!).render(<App />);

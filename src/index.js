import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Enregistrement du Service Worker pour le mode hors ligne
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🦔 Service Worker Sonic enregistré avec succès:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}

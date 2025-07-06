const CACHE_NAME = 'segarow-offline-v5';
const OFFLINE_URL = '/offline.html';
const SONIC_GAME_URL = '/dino_sonic/sonic_dino_game.html';

// Fichiers à mettre en cache
const urlsToCache = [
  OFFLINE_URL,
  SONIC_GAME_URL,
  '/dino_sonic/background.png',
  '/dino_sonic/start.png',
  '/dino_sonic/run_1.png',
  '/dino_sonic/run_2.png',
  '/dino_sonic/jump.png',
  '/dino_sonic/crouch.png',
  '/dino_sonic/game_over.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🦔 Service Worker Sonic v5 - Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Mise en cache des fichiers...');
        // Essayer de mettre en cache tous les fichiers un par un
        const cachePromises = urlsToCache.map((url) => {
          return fetch(url)
            .then((response) => {
              if (response.ok) {
                console.log('✅ Mis en cache:', url);
                return cache.put(url, response.clone());
              } else {
                console.log('⚠️ Impossible de mettre en cache:', url, response.status);
              }
            })
            .catch((error) => {
              console.log('❌ Erreur cache:', url, error.message);
            });
        });
        
        return Promise.allSettled(cachePromises);
      })
      .then(() => {
        console.log('🚀 Service Worker installé avec succès !');
      })
  );
  
  // Force l'activation immédiate
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker Sonic v5 - Activation...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('💚 Service Worker activé et prêt !');
      return self.clients.claim();
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // Ignorer les requêtes externes
  if (url.origin !== self.location.origin) return;
  
  console.log('🌐 Requête interceptée:', url.pathname);
  
  event.respondWith(
    fetch(request, { 
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'same-origin'
    })
      .then((response) => {
        console.log('✅ Réponse réseau OK pour:', url.pathname, response.status);
        
        // Si la réponse est OK, la retourner
        if (response.ok) {
          return response;
        }
        
        // Si erreur serveur (404, 500, etc.), essayer le cache
        console.log('⚠️ Erreur serveur pour:', url.pathname, 'Status:', response.status);
        throw new Error(`Server error: ${response.status}`);
      })
      .catch((error) => {
        console.log('❌ Échec réseau pour:', url.pathname, error.message);
        
        // Cas 1: Requête pour le jeu Sonic ou ses assets
        if (url.pathname.startsWith('/dino_sonic/')) {
          console.log('🎮 Recherche du jeu Sonic en cache...', url.pathname);
          
          // Essayer d'abord avec l'URL exacte
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('🎯 Jeu Sonic trouvé en cache (URL exacte) !');
                return cachedResponse;
              }
              
              // Si pas trouvé, essayer sans les paramètres de requête
              const cleanUrl = url.origin + url.pathname;
              console.log('🔍 Recherche sans paramètres:', cleanUrl);
              
              return caches.match(cleanUrl)
                .then((cleanCachedResponse) => {
                  if (cleanCachedResponse) {
                    console.log('🎯 Jeu Sonic trouvé en cache (URL nettoyée) !');
                    return cleanCachedResponse;
                  } else {
                    console.log('❌ Jeu Sonic non trouvé en cache:', url.pathname);
                    return new Response('Jeu Sonic non disponible hors ligne', {
                      status: 404,
                      statusText: 'Not Found'
                    });
                  }
                });
            });
        }
        
        // Cas 2: Requête de navigation (page HTML)
        if (request.mode === 'navigate') {
          console.log('📄 Redirection vers page hors ligne...');
          return caches.match(OFFLINE_URL)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('🎯 Page hors ligne trouvée en cache !');
                return cachedResponse;
              } else {
                console.log('❌ Page hors ligne non trouvée en cache');
                return new Response(`
                  <!DOCTYPE html>
                  <html>
                  <head><title>Hors ligne</title></head>
                  <body>
                    <h1>🦔 SEGAROW - Hors ligne</h1>
                    <p>Vous êtes hors ligne et la page de secours n'est pas disponible.</p>
                  </body>
                  </html>
                `, {
                  headers: { 'Content-Type': 'text/html' }
                });
              }
            });
        }
        
        // Cas 3: Autres ressources
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('📦 Ressource trouvée en cache:', url.pathname);
              return cachedResponse;
            } else {
              console.log('❌ Ressource non trouvée:', url.pathname);
              return new Response('Ressource non disponible hors ligne', {
                status: 404,
                statusText: 'Not Found'
              });
            }
          });
      })
  );
});

// Messages depuis l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 
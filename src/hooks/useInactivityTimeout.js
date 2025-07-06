import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

const useInactivityTimeout = (timeoutMinutes = 5) => {
  const { isAuthenticated, logout } = useAuth();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  
  // Convertir les minutes en millisecondes
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = (timeoutMinutes - 1) * 60 * 1000; // Avertissement 1 minute avant (4 minutes)

  // Fonction de déconnexion automatique
  const handleAutoLogout = useCallback(() => {
    if (isAuthenticated) {
      console.log('🕐 Déconnexion automatique - Inactivité détectée');
      logout();
      
      // Optionnel : Redirection vers login avec message
      const url = new URL('/login', window.location.origin);
      url.searchParams.set('message', 'session_expired');
      window.location.href = url.toString();
    }
  }, [isAuthenticated, logout]);

  // Fonction d'avertissement
  const handleWarning = useCallback(() => {
    if (isAuthenticated) {
      console.log('⚠️ Avertissement - Déconnexion dans 1 minute');
      
      // Afficher une notification discrète en haut à droite
      const notification = document.createElement('div');
      notification.id = 'inactivity-warning';
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #ff9800, #f57c00);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(255, 152, 0, 0.4);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          font-weight: 500;
          animation: slideInRight 0.3s ease-out;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          ⚠️ Déconnexion dans 1 minute par inactivité
        </div>
        <style>
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        </style>
      `;
      
      // Supprimer toute notification existante
      const existing = document.getElementById('inactivity-warning');
      if (existing) {
        existing.remove();
      }
      
      document.body.appendChild(notification);
      
      // Effet hover pour rendre interactive la notification
      const notifDiv = notification.querySelector('div');
      notifDiv.addEventListener('mouseenter', () => {
        notifDiv.style.transform = 'scale(1.05)';
      });
      notifDiv.addEventListener('mouseleave', () => {
        notifDiv.style.transform = 'scale(1)';
      });
      
      // Supprimer la notification après 10 secondes
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notifDiv.style.animation = 'slideInRight 0.3s ease-out reverse';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }
      }, 10000);
    }
  }, [isAuthenticated]);

  // Réinitialiser le timer d'inactivité
  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return;

    // Nettoyer les timers existants
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Démarrer le timer d'avertissement
    warningTimeoutRef.current = setTimeout(handleWarning, warningMs);
    
    // Démarrer le timer de déconnexion
    timeoutRef.current = setTimeout(handleAutoLogout, timeoutMs);
    
    console.log(`🔄 Timer d'inactivité réinitialisé - Avertissement dans ${warningMs/1000/60} minutes, Déconnexion dans ${timeoutMs/1000/60} minutes`);
  }, [isAuthenticated, timeoutMs, warningMs, handleAutoLogout, handleWarning, timeoutMinutes]);

  // Événements à surveiller pour détecter l'activité
  const activityEvents = [
    'mousedown',
    'mousemove', 
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      // Nettoyer les timers si pas connecté
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      return;
    }

    // Démarrer le timer initial
    resetInactivityTimer();

    // Ajouter les écouteurs d'événements
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Nettoyer les écouteurs et timers
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [isAuthenticated, resetInactivityTimer]);

  // Nettoyer les timers au démontage du composant
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  return {
    resetTimer: resetInactivityTimer
  };
};

export default useInactivityTimeout; 
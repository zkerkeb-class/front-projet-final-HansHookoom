import React, { useState, useEffect } from 'react';
import './InactivityWarning.css';

const InactivityWarning = ({ show, onContinue, onLogout, timeLeft = 60 }) => {
  const [countdown, setCountdown] = useState(timeLeft);

  useEffect(() => {
    if (!show) return;
    
    setCountdown(timeLeft);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show, timeLeft, onLogout]);

  if (!show) return null;

  return (
    <div className="inactivity-overlay">
      <div className="inactivity-modal">
        <div className="inactivity-icon">⏰</div>
        <h3 className="inactivity-title">Session expirée bientôt</h3>
        <p className="inactivity-message">
          Vous allez être déconnecté dans <strong>{countdown} secondes</strong> pour cause d'inactivité.
        </p>
        <div className="inactivity-actions">
          <button 
            onClick={onContinue}
            className="inactivity-btn continue"
          >
            Continuer la session
          </button>
          <button 
            onClick={onLogout}
            className="inactivity-btn logout"
          >
            Se déconnecter
          </button>
        </div>
        <div className="inactivity-progress">
          <div 
            className="inactivity-progress-bar"
            style={{
              width: `${((timeLeft - countdown) / timeLeft) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarning; 
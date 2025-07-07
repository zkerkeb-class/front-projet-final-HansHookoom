import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AnimatedText from '../../components/ui/AnimatedText/AnimatedText';
import styles from './Login.module.css';
import { useTranslation } from 'react-i18next';
import ApiService from '../../services/ApiService';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Vérifier si l'utilisateur arrive ici suite à une expiration de session
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'session_expired') {
      setError(t('login.sessionExpired'));
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Appel API vers votre backend MongoDB
      const data = await ApiService.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      // Connexion réussie
      login(data.user, data.token);
      
      // Rediriger vers l'accueil
      navigate('/');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!credentials.email || !credentials.password || !credentials.username) {
      setError('Veuillez remplir tous les champs pour l\'inscription');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Créer un compte utilisateur
      const data = await ApiService.post('/api/auth/register', {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username
        // role: 'visitor' // Supprimé, géré côté backend
      });

      // Inscription réussie, connexion automatique
      login(data.user, data.token);
      navigate('/');
      alert('Compte créé avec succès ! Vous êtes maintenant connecté.');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setError(error.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>
            <span className={styles.sonicIcon}>🌀</span> 
            <AnimatedText deps={[i18n.language]}>
              {t('login.title')}
            </AnimatedText>
          </h1>
          {/* <p className={styles.loginSubtitle}>Connectez-vous avec MongoDB !</p> */}
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AnimatedText deps={[i18n.language]}>
              {error}
            </AnimatedText>
          </div>
        )}

        {!isRegisterMode ? (
          // Mode Connexion
          <form onSubmit={handleSubmit}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <AnimatedText deps={[i18n.language]}>
                  {t('login.email')}
                </AnimatedText>
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
                className={styles.formInput}
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <AnimatedText deps={[i18n.language]}>
                  {t('login.password')}
                </AnimatedText>
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                className={styles.formInput}
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${styles.primaryButton} ${styles.loginButton} emoji-button emoji-key`}
            >
              <AnimatedText deps={[i18n.language]}>
                {loading ? t('login.loading') : t('login.loginBtn')}
              </AnimatedText>
            </button>
          </form>
        ) : (
          // Mode Inscription
          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <AnimatedText deps={[i18n.language]}>
                  {t('login.email')}
                </AnimatedText>
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
                className={styles.formInput}
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <AnimatedText deps={[i18n.language]}>
                  {t('login.username')}
                </AnimatedText>
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 20); // Limiter à 20 caractères
                  setCredentials(prev => ({...prev, username: value}));
                }}
                className={styles.formInput}
                placeholder={t('login.usernamePlaceholder')}
                maxLength={20}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <AnimatedText deps={[i18n.language]}>
                  {t('login.password')}
                </AnimatedText>
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                className={styles.formInput}
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${styles.primaryButton} ${styles.registerButton} emoji-button emoji-sparkle`}
            >
              <AnimatedText deps={[i18n.language]}>
                {loading ? t('login.loadingRegister') : t('login.registerBtn')}
              </AnimatedText>
            </button>
          </form>
        )}

        <div className={styles.modeToggle}>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
              setCredentials({ email: '', password: '', username: '' });
            }}
            className={`${styles.toggleButton} emoji-button ${isRegisterMode ? 'emoji-key' : 'emoji-sparkle'}`}
          >
            <AnimatedText deps={[i18n.language]}>
              {isRegisterMode ? t('login.alreadyHaveAccount') : t('login.noAccount')}
            </AnimatedText>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
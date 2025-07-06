import React, { useState, useEffect } from 'react';
import AnimatedText from '../../ui/AnimatedText/AnimatedText';
import styles from './UserManager.module.css';
import { useTranslation } from 'react-i18next';
import ApiService from '../../../services/ApiService';

const UserManager = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await ApiService.get('/api/admin/users', true);
      setUsers(data.users || []);
    } catch (err) {
      setError(t('userManager.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (e) => {
    e.preventDefault();
    
    if (!promoteEmail.trim()) {
      setError(t('userManager.enterEmail'));
      return;
    }

    try {
      setPromoteLoading(true);
      setError('');

      const data = await ApiService.post('/api/admin/promote-user', { email: promoteEmail }, true);

      alert(`✅ ${data.message}`);
      setPromoteEmail('');
      loadUsers(); // Recharger la liste
    } catch (err) {
      setError(err.message || t('userManager.promoteError'));
    } finally {
      setPromoteLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username, email) => {
    const confirmMessage = t('userManager.deleteConfirm', { username, email });

    const confirmation = prompt(confirmMessage);
    
    if (confirmation !== 'SUPPRIMER') {
      alert(t('userManager.deleteCancelled'));
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [userId]: true }));
      setError('');

      // Utiliser une requête fetch personnalisée pour DELETE avec body
      const token = localStorage.getItem('segarow_token');
      const response = await fetch(`${ApiService.API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ confirmAction: true })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}\n\nDonnées supprimées :\n• ${data.deletedData.likes} likes\n• ${data.deletedData.articles} articles\n• ${data.deletedData.reviews} reviews`);
        loadUsers(); // Recharger la liste
      } else {
        setError(data.message || t('userManager.deleteError'));
      }
    } catch (err) {
      setError(err.message || t('userManager.deleteError'));
    } finally {
      setDeleteLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCleanupOrphanedLikes = async () => {
    if (!window.confirm(t('userManager.cleanupConfirm'))) {
      return;
    }

    try {
      setCleanupLoading(true);
      setError('');

      const data = await ApiService.post('/api/admin/cleanup-orphaned-likes', {}, true);

      alert(`✅ ${data.message}`);
      loadUsers(); // Recharger pour voir les changements
    } catch (err) {
      setError(err.message || t('userManager.cleanupError'));
    } finally {
      setCleanupLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.userManager}>
      <div className={styles.header}>
        <h2>👥 
          <AnimatedText deps={[i18n.language]}>
            {t('userManager.title')}
          </AnimatedText>
        </h2>
        <div className={styles.headerActions}>
          <button 
            onClick={handleCleanupOrphanedLikes}
            disabled={cleanupLoading}
            className={styles.cleanupBtn}
          >
            <AnimatedText deps={[i18n.language]}>
              {cleanupLoading ? t('userManager.cleaning') : t('userManager.cleanupLikes')}
            </AnimatedText>
          </button>
          <button onClick={loadUsers} className={styles.refreshBtn}>
            🔄 
            <AnimatedText deps={[i18n.language]}>
              {t('userManager.refresh')}
            </AnimatedText>
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>❌ 
        <AnimatedText deps={[i18n.language]}>
          {error}
        </AnimatedText>
      </div>}

      {/* Section Promotion Admin */}
      <div className={styles.promoteSection}>
        <h3>🔧 
          <AnimatedText deps={[i18n.language]}>
            {t('userManager.promoteTitle')}
          </AnimatedText>
        </h3>
        <form onSubmit={handlePromoteUser} className={styles.promoteForm}>
          <div className={styles.promoteInput}>
            <input
              type="email"
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              placeholder={t('userManager.emailPlaceholder')}
              className={styles.emailInput}
              required
            />
            <button
              type="submit"
              disabled={promoteLoading}
              className={styles.promoteBtn}
            >
              <AnimatedText deps={[i18n.language]}>
                {promoteLoading ? t('userManager.promoting') : t('userManager.promote')}
              </AnimatedText>
            </button>
          </div>
          <p className={styles.promoteNote}>
            ⚠️ 
            <AnimatedText deps={[i18n.language]}>
              Cette action est irréversible. L'utilisateur aura accès à l'administration.
            </AnimatedText>
          </p>
        </form>
      </div>

      {/* Liste des utilisateurs */}
      <div className={styles.usersSection}>
        <h3>📋 
          <AnimatedText deps={[i18n.language]}>
            {t('userManager.userList', { count: users.length })}
          </AnimatedText>
        </h3>
        
        {loading ? (
          <div className={styles.loading}>
            <AnimatedText deps={[i18n.language]}>
              {t('userManager.loading')}
            </AnimatedText>
          </div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <AnimatedText deps={[i18n.language]}>
              {t('userManager.noUsers')}
            </AnimatedText>
          </div>
        ) : (
          <div className={styles.usersList}>
            {users.map((user) => (
              <div key={user._id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <div className={styles.userMain}>
                    <div className={styles.userName}>
                      {user.role === 'admin' ? '🔧' : '👤'} {user.username}
                    </div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                  <div className={styles.userMeta}>
                    <div className={styles.userRole}>
                      {user.role === 'admin' ? (
                        <span className={styles.adminRole}>🛡️ 
                          <AnimatedText deps={[i18n.language]}>
                            {t('userManager.admin')}
                          </AnimatedText>
                        </span>
                      ) : (
                        <span className={styles.visitorRole}>👤 
                          <AnimatedText deps={[i18n.language]}>
                            {t('userManager.visitor')}
                          </AnimatedText>
                        </span>
                      )}
                    </div>
                    <div className={styles.userDate}>
                      📅 
                      <AnimatedText deps={[i18n.language]}>
                        {t('userManager.registeredOn', { date: formatDate(user.createdAt) })}
                      </AnimatedText>
                    </div>
                  </div>
                  <div className={styles.userActions}>
                    <button
                      onClick={() => handleDeleteUser(user._id, user.username, user.email)}
                      disabled={deleteLoading[user._id]}
                      className={styles.deleteUserBtn}
                      title={t('userManager.deleteUser')}
                    >
                      {deleteLoading[user._id] ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager; 
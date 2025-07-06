// src/hooks/useAuth.js - VERSION CORRIGÉE POUR VISITOR
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook personnalisé pour la persistance
  useEffect(() => {
    const savedToken = localStorage.getItem('segarow_token');
    const savedUser = localStorage.getItem('segarow_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur parsing user:', error);
        localStorage.removeItem('segarow_token');
        localStorage.removeItem('segarow_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('segarow_token', userToken);
    localStorage.setItem('segarow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('segarow_token');
    localStorage.removeItem('segarow_user');
  };

  // Vérifications des rôles (CORRIGÉ pour visitor)
  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';
  const isVisitor = user?.role === 'visitor'; // Nouvel ajout
  const canInteract = isAuthenticated; // Visitor et Admin peuvent interagir
  const canCreatePosts = isAdmin; // Seul admin peut créer
  const canManageComments = isAdmin; // Seul admin peut gérer

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isVisitor, // Nouveau
    canInteract,
    canCreatePosts,
    canManageComments
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
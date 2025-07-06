import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import useInactivityTimeout from './hooks/useInactivityTimeout';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import News from './pages/News/News';
import Reviews from './pages/Reviews/Reviews';
import Video from './pages/Video/Video';
import SingleContent from './pages/SingleContent/SingleContent';
import Profile from './pages/Profile/Profile';
import AboutUs from './pages/AboutUs/AboutUs';
import AdminDashboard from './components/admin/AdminDashboard/AdminDashboard';
import GlobalStyles from './styles/GlobalStyles';
import NotFound from './pages/NotFound/NotFound';
import styles from './App.module.css';
import { ThemeProvider } from './context/ThemeContext';
import './styles/Emojis.css';

// Composant pour gérer la redirection de la route racine
const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingIcon}>🌀</div>
          <div>Chargement de Segarow...</div>
        </div>
      </div>
    );
  }
  
  // Redirection vers home par défaut (accessible même connecté)
  return <Navigate to="/home" replace />;
};

// Composant principal des routes
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  // Activer le timeout d'inactivité de 5 minutes pour tous les utilisateurs connectés
  useInactivityTimeout(5);

  return (
    <div className="App">
      {/* Header affiché partout */}
      <Header />
      
      <Routes>
        {/* Route racine avec logique d'authentification */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Pages publiques */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Login />
        } />
        
        {/* Pages de contenu */}
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<SingleContent />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews/:slug" element={<SingleContent />} />
        <Route path="/videos" element={<Video />} />
        <Route path="/about" element={<AboutUs />} />
        
        {/* Pages protégées */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Page d'administration (Admin seulement) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Route 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Footer affiché partout */}
      <Footer />
    </div>
  );
};

// App principal
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <GlobalStyles />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 
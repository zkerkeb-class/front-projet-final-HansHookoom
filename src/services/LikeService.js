const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class LikeService {
  // Récupérer le token depuis localStorage
  getAuthHeaders() {
    const token = localStorage.getItem('segarow_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Liker/Unliker un contenu
  async toggleLike(contentType, contentId) {
    try {
      const response = await fetch(`${API_URL}/api/likes/${contentType}/${contentId}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur toggle like:', error);
      throw error;
    }
  }

  // Obtenir l'état de like d'un contenu
  async getLikeStatus(contentType, contentId) {
    try {
      const response = await fetch(`${API_URL}/api/likes/${contentType}/${contentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération état like:', error);
      throw error;
    }
  }

  // [ADMIN] Obtenir la liste des likes pour un contenu
  async getContentLikes(contentType, contentId) {
    try {
      const response = await fetch(`${API_URL}/api/admin/likes/${contentType}/${contentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération likes contenu:', error);
      throw error;
    }
  }

  // [ADMIN] Obtenir les statistiques des likes
  async getLikesStats() {
    try {
      const response = await fetch(`${API_URL}/api/admin/likes/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération stats likes:', error);
      throw error;
    }
  }
}

export default new LikeService(); 
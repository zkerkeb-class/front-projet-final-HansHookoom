// Configuration intelligente de l'URL de l'API selon l'environnement
const getApiBaseUrl = () => {
  // Si une variable d'environnement est définie, l'utiliser
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // En production, utiliser l'URL relative (même domaine)
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  
  // En développement, utiliser localhost par défaut
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  static API_BASE_URL = API_BASE_URL;
  
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Récupérer le token depuis le localStorage
  getAuthToken() {
    return localStorage.getItem('segarow_token');
  }

  // Méthode statique pour récupérer le token (pour ImageService)
  static getAuthToken() {
    return localStorage.getItem('segarow_token');
  }

  // Headers par défaut
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // Méthode générique pour les requêtes
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.requireAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Erreur API ${endpoint}:`, error);
      throw error;
    }
  }

  // GET
  async get(endpoint, requireAuth = false) {
    return this.request(endpoint, {
      method: 'GET',
      requireAuth,
    });
  }

  // POST
  async post(endpoint, data, requireAuth = false) {
    return this.request(endpoint, {
      method: 'POST',
      requireAuth,
      body: JSON.stringify(data),
    });
  }

  // PUT
  async put(endpoint, data, requireAuth = false) {
    return this.request(endpoint, {
      method: 'PUT',
      requireAuth,
      body: JSON.stringify(data),
    });
  }

  // DELETE
  async delete(endpoint, requireAuth = false) {
    return this.request(endpoint, {
      method: 'DELETE',
      requireAuth,
    });
  }
}

const apiServiceInstance = new ApiService();

// Exporter l'instance avec les propriétés statiques
apiServiceInstance.API_BASE_URL = API_BASE_URL;
apiServiceInstance.getAuthToken = ApiService.getAuthToken;

export default apiServiceInstance;

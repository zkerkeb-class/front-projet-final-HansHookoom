import ApiService from './ApiService';

class ImageService {
  // Uploader une image
  static async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${ApiService.API_BASE_URL}/api/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ApiService.getAuthToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'upload');
      }

      return data;
    } catch (error) {
      console.error('Erreur upload image:', error);
      throw error;
    }
  }

  // Récupérer la liste des images
  static async getImages() {
    try {
      const response = await fetch(`${ApiService.API_BASE_URL}/api/images`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ApiService.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des images');
      }

      return data.images;
    } catch (error) {
      console.error('Erreur récupération images:', error);
      throw error;
    }
  }

  // Supprimer une image
  static async deleteImage(imageId) {
    try {
      const response = await fetch(`${ApiService.API_BASE_URL}/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ApiService.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      return data;
    } catch (error) {
      console.error('Erreur suppression image:', error);
      throw error;
    }
  }

  // Récupérer l'URL complète d'une image
  static getImageUrl(imageId) {
    if (!imageId) return null;
    return `${ApiService.API_BASE_URL}/api/images/${imageId}`;
  }

  // Vérifier si une URL est une image depuis la base de données
  static isDbImage(imageUrl) {
    return imageUrl && (imageUrl.includes('/api/images/') || imageUrl.startsWith('/api/images/'));
  }
}

export default ImageService; 
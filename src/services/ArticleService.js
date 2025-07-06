import ApiService from './ApiService';

class ArticleService {
  // Récupérer tous les articles
  async getArticles(page = 1, limit = 10) {
    return ApiService.get(`/articles?page=${page}&limit=${limit}`);
  }

  // Récupérer un article par son ID
  async getArticleById(id) {
    return ApiService.get(`/articles/${id}`);
  }

  // Récupérer un article par son slug
  async getArticleBySlug(slug) {
    return ApiService.get(`/articles/${slug}`);
  }

  // Créer un nouvel article (Admin seulement)
  async createArticle(articleData) {
    return ApiService.post('/articles', articleData, true);
  }

  // Modifier un article (Admin seulement)
  async updateArticle(id, articleData) {
    return ApiService.put(`/articles/${id}`, articleData, true);
  }

  // Supprimer un article (Admin seulement)
  async deleteArticle(id) {
    return ApiService.delete(`/articles/${id}`, true);
  }

  // Générer un slug à partir du titre
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Valider les données d'un article
  validateArticle(article) {
    const errors = {};

    if (!article.title || article.title.trim().length < 3) {
      errors.title = 'Le titre doit contenir au moins 3 caractères';
    }

    if (!article.slug || article.slug.trim().length < 3) {
      errors.slug = 'Le slug doit contenir au moins 3 caractères';
    }

    if (!article.excerpt || article.excerpt.trim().length < 10) {
      errors.excerpt = 'L\'extrait doit contenir au moins 10 caractères';
    }

    if (!article.content || article.content.trim().length < 50) {
      errors.content = 'Le contenu doit contenir au moins 50 caractères';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new ArticleService();

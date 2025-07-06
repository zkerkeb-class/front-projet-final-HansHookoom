import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import ApiService from '../../../services/ApiService';
import Comment from '../Comment/Comment';
import styles from './CommentSection.module.css';
import { useTranslation } from 'react-i18next';

const CommentSection = ({ contentId, contentType }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // État pour le tri
  const [sortBy, setSortBy] = useState('recent'); // 'recent' ou 'likes'
  
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const loadComments = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const endpoint = contentType === 'article' 
        ? `/api/comments/news/${contentId}?page=${page}&limit=5&sortBy=${sortBy}`
        : `/api/comments/review/${contentId}?page=${page}&limit=5&sortBy=${sortBy}`;
      
      const response = await ApiService.get(endpoint, true); // Envoyer l'auth si disponible
      
      if (append) {
        // Lors du chargement de commentaires supplémentaires, on ajoute tous les commentaires
        // et on laisse la fonction organizeCommentsForDisplay s'occuper de la hiérarchie
        setComments(prev => {
          // Créer une liste de tous les commentaires (anciens + nouveaux) sans doublons
          const allComments = [...prev, ...response.comments];
          const uniqueComments = allComments.filter((comment, index, self) => 
            index === self.findIndex(c => c._id === comment._id)
          );
          return uniqueComments;
        });
      } else {
        setComments(response.comments);
      }
      
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalComments(response.pagination.totalComments);
      setHasNextPage(response.pagination.hasNextPage);
      
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
      alert('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreComments = () => {
    if (hasNextPage && !loadingMore) {
      loadComments(currentPage + 1, true);
    }
  };

  useEffect(() => {
    loadComments();
  }, [contentId, contentType]);

  // Recharger les commentaires quand le tri change
  useEffect(() => {
    setCurrentPage(1);
    loadComments(1, false);
  }, [sortBy]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour commenter');
      return;
    }

    if (!newComment.trim()) {
      alert('Le commentaire ne peut pas être vide');
      return;
    }

    setSubmitting(true);
    
    try {
      const commentData = {
        content: newComment,
        [contentType === 'article' ? 'articleId' : 'reviewId']: contentId
      };
      
      await ApiService.post('/api/comments', commentData, true);
      setNewComment('');
      alert('Commentaire ajouté avec succès');
      // Recharger tous les commentaires
      setCurrentPage(1);
      loadComments(1, false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId, content) => {
    if (!content.trim()) {
      alert('La réponse ne peut pas être vide');
      return;
    }

    setSubmitting(true);
    
    try {
      const replyData = {
        content: content,
        [contentType === 'article' ? 'articleId' : 'reviewId']: contentId,
        parentCommentId: commentId
      };
      
      await ApiService.post('/api/comments', replyData, true);
      alert('Réponse ajoutée avec succès');
      // Recharger tous les commentaires
      setCurrentPage(1);
      loadComments(1, false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      alert('Erreur lors de l\'ajout de la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      await ApiService.delete(`/api/comments/${commentId}`, true);
      alert('Commentaire supprimé');
      // Recharger tous les commentaires
      setCurrentPage(1);
      loadComments(1, false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du commentaire');
    }
  };

  const handleForceDeleteComment = async (commentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce commentaire ?\n\nCette action est irréversible.')) {
      return;
    }

    try {
      await ApiService.delete(`/api/comments/${commentId}/force`, true);
      alert('Commentaire supprimé définitivement');
      // Recharger tous les commentaires
      setCurrentPage(1);
      loadComments(1, false);
    } catch (error) {
      console.error('Erreur lors de la suppression définitive:', error);
      alert('Erreur lors de la suppression définitive du commentaire');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour aimer un commentaire');
      return;
    }

    try {
      // Utiliser la route toggle qui gère automatiquement like/unlike
      await ApiService.post(`/api/likes/comment/${commentId}`, {}, true);
      
      // Recharger tous les commentaires pour mettre à jour les likes
      setCurrentPage(1);
      loadComments(1, false);
    } catch (error) {
      console.error('Erreur lors du like:', error);
      alert('Erreur lors de la mise à jour du like');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement des commentaires...</div>;
  }

  // Calculer la profondeur correcte de chaque commentaire
  const calculateCommentDepth = (comment, allComments, depth = 0) => {
    if (!comment.parentComment) {
      return 0; // Commentaire principal
    }
    
    // Trouver le commentaire parent dans la liste complète
    const parent = allComments.find(c => c._id === comment.parentComment._id);
    if (!parent) {
      return 1; // Parent non trouvé, considérer comme niveau 1
    }
    
    // Calculer récursivement la profondeur
    return calculateCommentDepth(parent, allComments, depth + 1) + 1;
  };

  const commentsWithDepth = comments.map(comment => ({
    ...comment,
    replyDepth: calculateCommentDepth(comment, comments)
  }));

  return (
    <div className={styles.commentSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>
          {t('comments.title', { count: totalComments })}
        </h3>
        
        <div className={styles.sortContainer}>
          <label className={styles.sortLabel}>{t('comments.sortBy')}</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="recent">{t('comments.mostRecent')}</option>
            <option value="likes">{t('comments.mostLiked')}</option>
          </select>
        </div>
      </div>

      {isAuthenticated && (
        <form onSubmit={handleSubmitComment} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('comments.placeholder')}
            className={styles.commentInput}
            disabled={submitting}
          />
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? t('comments.publishing') : t('comments.publish')}
          </button>
        </form>
      )}

      {!isAuthenticated && (
        <p className={styles.loginPrompt}>
          {t('comments.loginPrompt')}
        </p>
      )}

      <div className={styles.commentsList}>
        {commentsWithDepth.map((comment) => (
          <Comment
            key={comment._id}
            comment={comment}
            onDelete={handleDeleteComment}
            onForceDelete={handleForceDeleteComment}
            onLike={handleLikeComment}
            onReply={handleSubmitReply}
            currentUser={user}
          />
        ))}
      </div>

      {hasNextPage && (
        <div className={styles.loadMoreContainer}>
          <button
            onClick={loadMoreComments}
            className={styles.loadMoreBtn}
            disabled={loadingMore}
          >
            {loadingMore ? t('comments.loading') : t('comments.loadMore', { count: totalComments - comments.length })}
          </button>
        </div>
      )}

      {comments.length === 0 && (
        <p className={styles.noComments}>{t('comments.none')}</p>
      )}
    </div>
  );
};

export default CommentSection; 
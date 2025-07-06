import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AnimatedText from '../../components/ui/AnimatedText/AnimatedText';
import ArticleService from '../../services/ArticleService';
import ReviewService from '../../services/ReviewService';
import LikeService from '../../services/LikeService';
import ImageService from '../../services/ImageService';
import AssetService from '../../services/AssetService';
import ImageWithSkeleton from '../../components/ui/ImageWithSkeleton/ImageWithSkeleton';
import ConsoleLogo from '../../components/ui/ConsoleLogo/ConsoleLogo';
import CommentSection from '../../components/sections/CommentSection/CommentSection';
import { useAuth } from '../../hooks/useAuth';
import useShare from '../../hooks/useShare';
import DOMPurify from 'dompurify';
import styles from './SingleContent.module.css';

const SingleContent = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { share } = useShare();
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour les likes
  const [likeLoading, setLikeLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showSonicAnimation, setShowSonicAnimation] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  // Détecter le type de contenu basé sur l'URL
  const isReview = location.pathname.startsWith('/reviews/');
  const contentType = isReview ? 'review' : 'article';

  useEffect(() => {
    loadContent();
  }, [slug, contentType]);

  useEffect(() => {
    // Charger l'état des likes quand le contenu est chargé
    if (content && isAuthenticated) {
      loadLikeStatus();
    }
  }, [content, isAuthenticated]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (isReview) {
        // Récupérer la review par slug
        response = await ReviewService.getReviewById(slug);
        setContent(response.review);
        setLikeCount(response.review.likeCount || 0);
      } else {
        // Récupérer l'article par slug
        response = await ArticleService.getArticleBySlug(slug);
        setContent(response.article);
        setLikeCount(response.article.likeCount || 0);
      }
    } catch (err) {
      console.error(`Erreur chargement ${contentType}:`, err);
      setError(err.message || t('singleContent.notFoundDesc', { type: contentType }));
    } finally {
      setLoading(false);
    }
  };

  const loadLikeStatus = async () => {
    try {
      const response = await LikeService.getLikeStatus(contentType, content._id);
      setLiked(response.liked);
      setLikeCount(response.likeCount);
    } catch (error) {
      console.error('Erreur chargement état like:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert(t('singleContent.mustBeLoggedIn'));
      return;
    }

    if (likeLoading) return;

    try {
      setLikeLoading(true);
      const response = await LikeService.toggleLike(contentType, content._id);
      
      setLiked(response.liked);
      setLikeCount(response.likeCount);
      
      // Déclencher l'animation de Sonic si on vient de liker
      if (response.liked) {
        setShowSonicAnimation(true);
        // Réinitialiser l'animation après 2 secondes
        setTimeout(() => {
          setShowSonicAnimation(false);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Erreur like:', error);
      alert(t('singleContent.likeError'));
    } finally {
      setLikeLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (isSharing || !content) return;
    
    setIsSharing(true);
    setShareMessage("");
    
    try {
      const title = isReview ? (content.gameTitle || content.title) : content.title;
      const description = content.excerpt || t('singleContent.shareDescription', { 
        type: isReview ? t('singleContent.review') : t('singleContent.article'),
        title 
      });
      const url = window.location.href;
      
      const result = await share(url, title, description);
      setShareMessage(result.message);
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      setShareMessage(t('singleContent.shareError'));
    } finally {
      setIsSharing(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4CAF50'; // Vert
    if (rating >= 6) return '#FF9800'; // Orange
    if (rating >= 4) return '#FFC107'; // Jaune
    return '#F44336'; // Rouge
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = (rating % 2) >= 1;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>
          <AnimatedText deps={[i18n.language]}>
            {t('singleContent.loading', { type: contentType })}
          </AnimatedText>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className={styles.errorContainer}>
        <h1 className="emoji-error">
          <AnimatedText deps={[i18n.language]}>
            {t('singleContent.notFound', { type: contentType === 'review' ? 'Review' : 'Article' })}
          </AnimatedText>
        </h1>
        <p>
          <AnimatedText deps={[i18n.language]}>
            {error || t('singleContent.notFoundDesc', { type: contentType })}
          </AnimatedText>
        </p>
        <button 
          onClick={() => navigate(isReview ? '/reviews' : '/news')}
          className={styles.backButton}
        >
          <AnimatedText deps={[i18n.language]}>
            {t('singleContent.backTo', { type: isReview ? 'review' : 'article' })}
          </AnimatedText>
        </button>
      </div>
    );
  }

  return (
    <main className={styles.singleGlobalContent}>
      <h1 className={styles.singleMainTitle}>
        {isReview ? (content.gameTitle || content.title) : content.title}
      </h1>
      
      <div className={styles.singleInfo}>
        <div className={styles.singleContent}>
          {content.image && (
            <ImageWithSkeleton
              src={ImageService.isDbImage(content.image) 
                ? ImageService.getImageUrl(content.image.split('/').pop())
                : content.image
              } 
              alt={content.title}
              className={styles.singleImage}
              skeletonHeight="350px"
              skeletonProps={{ className: 'slow' }}
            />
          )}
          
          <div className={styles.singleText}>
            {content.content ? (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.content) }} />
            ) : content.excerpt ? (
              <div>{content.excerpt}</div>
            ) : (
              <div>
                <AnimatedText deps={[i18n.language]}>
                  {t('singleContent.noContent')}
                </AnimatedText>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.singleMeta}>
          <div className={styles.singleDivInfo}>
            <div className={styles.singlePublishDate}>
              <AnimatedText deps={[i18n.language]}>
                {t('singleContent.writtenOn', { 
                  date: formatDate(content.createdAt), 
                  author: content.author?.username || content.author?.email || t('singleContent.unknownAuthor')
                })}
              </AnimatedText>
            </div>
            
            {/* Affichage spécifique aux reviews */}
            {isReview && content.genre && (
              <div className={styles.singleLikesSection}>
                <span className="emoji-game">
                  <AnimatedText deps={[i18n.language]}>
                    {t('singleContent.genre', { genre: content.genre })}
                  </AnimatedText>
                </span>
              </div>
            )}
            
            {isReview && content.platform && (
              <div className={styles.singleLikesSection}>
                <span>
                  <AnimatedText deps={[i18n.language]}>
                    {t('singleContent.console')}
                  </AnimatedText>
                </span>
                <ConsoleLogo 
                  platform={content.platform} 
                  size="small" 
                  className="inMeta"
                />
              </div>
            )}
            
            {isReview && content.rating && (
              <div className={styles.singleLikesSection}>
                <span 
                  className={styles.ratingScore}
                  style={{ '--rating-color': getRatingColor(content.rating) }}
                >
                  {content.rating}/10
                </span>
                <span className={styles.ratingStars}>
                  {getRatingStars(content.rating)}
                </span>
              </div>
            )}
            
            <div className={styles.singleLikesSection}>
              <span className={`${styles.singleLikesCount} emoji-heart`}>
                <AnimatedText deps={[i18n.language]}>
                  {t('singleContent.likesCount', { 
                    count: likeCount, 
                    likes: likeCount <= 1 ? t('singleContent.like') : t('singleContent.likes'),
                    type: isReview ? t('singleContent.review') : t('singleContent.article')
                  })}
                </AnimatedText>
              </span>
            </div>
            
            {content.readingTime && (
              <div className={styles.singleReadingTime}>
                <span>{content.readingTime}</span>
                <span className={`${styles.singleClock} emoji-time`}></span>
              </div>
            )}
          </div>
          
          <div className={styles.singleLikeButtonContainer}>
            <button 
              className={`${styles.singleLikeButton} ${liked ? styles.singlePrimary : styles.singleSecondary} ${showSonicAnimation ? styles.singleAnimating : ''} emoji-button ${liked ? 'emoji-heart' : 'emoji-heart-outline'}`}
              onClick={handleLike}
              disabled={likeLoading}
            >
              <AnimatedText deps={[i18n.language]}>
                {likeLoading ? t('singleContent.loadingLike') : (liked ? t('singleContent.likeButton') : t('singleContent.unlikeButton'))}
              </AnimatedText>
            </button>
            
            {/* Animation Sonic, Tails et Knuckles qui courent */}
            {showSonicAnimation && (
              <div 
                className={styles.sonicRunner}
                style={{ '--sonic-background': AssetService.getCSSBackground('bg-stage-sonic.gif') }}
              >
                {/* Knuckles court en arrière */}
                <img 
                  src={AssetService.getPublicImage('knuckles-run.gif')} 
                  alt="Knuckles court" 
                  className={styles.knucklesGif}
                />
                {/* Tails court au milieu */}
                <img 
                  src={AssetService.getPublicImage('tails-run.gif')} 
                  alt="Tails court" 
                  className={styles.tailsGif}
                />
                {/* Sonic court devant */}
                <img 
                  src={AssetService.getPublicImage('sonic-run.gif')} 
                  alt="Sonic court" 
                  className={styles.sonicGif}
                />
              </div>
            )}
          </div>

          <button 
            className={`${styles.singleLikeButton} ${styles.singleSecondary} ${styles.singleShareButton}`}
            onClick={handleShare}
            disabled={isSharing}
          >
            <AnimatedText deps={[i18n.language]}>
              {isSharing ? t('singleContent.sharing') : t('singleContent.share')}
            </AnimatedText>
          </button>
          {shareMessage && (
            <div className={styles.shareMessage}>
              <AnimatedText deps={[i18n.language]}>
                {shareMessage}
              </AnimatedText>
            </div>
          )}
        </div>
      </div>
      
      {/* Section commentaires - pour les articles ET les reviews */}
      {content && (
        <CommentSection 
          contentId={content._id}
          contentType={isReview ? 'review' : 'article'}
        />
      )}
      
      <section className={styles.singleSimilarContent}>
        <div className={styles.singleSimilarContentContainer}>
          <h2 className={styles.singleSimilarContentTitle}>
            <AnimatedText deps={[i18n.language]}>
              {isReview ? t('singleContent.similarReviews') : t('singleContent.similarArticles')}
            </AnimatedText>
          </h2>
          <div className={styles.singleGrid}>
            <p>
              <AnimatedText deps={[i18n.language]}>
                {isReview ? t('singleContent.similarReviews') : t('singleContent.similarArticles')} {t('singleContent.comingSoon')}
              </AnimatedText>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SingleContent; 
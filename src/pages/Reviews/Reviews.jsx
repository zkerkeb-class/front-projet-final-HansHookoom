import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import ImageService from '../../services/ImageService';
import AssetService from '../../services/AssetService';
import ConsoleLogo from '../../components/ui/ConsoleLogo/ConsoleLogo';
import Pagination from '../../components/ui/Pagination/Pagination';
import styles from './Reviews.module.css';
import { useTranslation } from 'react-i18next';
import AnimatedText from '../../components/ui/AnimatedText/AnimatedText';
import ErrorState from '../../components/ui/ErrorState/ErrorState';

const Reviews = () => {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const { data, loading, error, refetch } = useApi(`/reviews?page=${currentPage}&limit=${reviewsPerPage}`);
  
  const reviews = useMemo(() => {
    return data?.reviews || [];
  }, [data]);

  const totalPages = useMemo(() => {
    return data?.pagination?.total || 1;
  }, [data]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return AssetService.getDefaultArticleFallback();
    
    if (ImageService.isDbImage(imageUrl)) {
      return ImageService.getImageUrl(imageUrl.split('/').pop());
    }
    
    return imageUrl;
  };

  if (loading && reviews.length === 0) {
    return (
      <section className={styles.reviewContainer}>
        <h2>
          <AnimatedText deps={[i18n.language]}>
            {t('reviews.title')}
          </AnimatedText>
        </h2>
        <ErrorState
          type="loading"
          emoji="📝"
          message={t('reviews.loading')}
        />
      </section>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <section className={styles.reviewContainer}>
        <h2>
          <AnimatedText deps={[i18n.language]}>
            {t('reviews.title')}
          </AnimatedText>
        </h2>
        <ErrorState
          type="error"
          emoji="❌"
          message={t('reviews.error')}
          buttonText={t('articlesSection.retry')}
          onRetry={refetch}
        />
      </section>
    );
  }

  return (
    <section className={styles.reviewContainer}>
      <h2>
        <AnimatedText deps={[i18n.language]}>
          {t('reviews.title')}
        </AnimatedText>
      </h2>
      <div>
        {reviews.length === 0 ? (
          <div>
            <AnimatedText deps={[i18n.language]}>
              {t('reviews.none')}
            </AnimatedText>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <article key={review._id} className={styles.reviewCard}>
                <Link to={`/reviews/${review.slug}`} className={styles.reviewCardLink}>
                  <div className={styles.reviewGameImage}>
                    <img 
                      src={getImageSrc(review.image)} 
                      alt={review.title}
                      onError={(e) => {
                        if (!e.target.dataset.errorHandled) {
                          e.target.dataset.errorHandled = 'true';
                          e.target.src = AssetService.getDefaultArticleFallback();
                        }
                      }}
                    />
                  </div>
                  
                  <div className={styles.reviewContent}>
                    <h2 className={styles.reviewGameTitle}>
                      <AnimatedText deps={[i18n.language]}>{review.title}</AnimatedText>
                    </h2>
                    
                    {review.genre && (
                      <div className={styles.reviewGameGenre}>
                        <span>
                          <AnimatedText deps={[i18n.language]}>
                            {t('reviews.genre')}
                          </AnimatedText>
                        </span>
                        {/* <AnimatedText deps={[i18n.language]}>{review.genre}</AnimatedText> */}
                        &nbsp;{review.genre}
                      </div>
                    )}
                    
                    {review.platform && (
                      <div className={styles.reviewGameGenre}>
                        <span>
                          <AnimatedText deps={[i18n.language]}>
                            {t('reviews.console')}
                          </AnimatedText>
                        </span>
                        <ConsoleLogo 
                          platform={review.platform} 
                          size="small" 
                          className="inMeta"
                        />
                      </div>
                    )}

                    <div className={styles.reviewText}>
                      {/* <AnimatedText deps={[i18n.language]}>{review.excerpt || review.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}</AnimatedText> */}
                      {review.excerpt || review.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                    </div>
                    
                    <span className={styles.reviewReadMoreBtn}>
                      <AnimatedText deps={[i18n.language]}>
                        {t('reviews.readMore')}
                      </AnimatedText>
                    </span>
                  </div>
                </Link>
              </article>
            ))}

            {/* Pagination */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default Reviews; 
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import ImageService from '../../services/ImageService';
import AssetService from '../../services/AssetService';
import AnimatedText from '../../components/ui/AnimatedText/AnimatedText';
import Pagination from '../../components/ui/Pagination/Pagination';
import styles from './News.module.css';
import { useTranslation } from 'react-i18next';
import ErrorState from '../../components/ui/ErrorState/ErrorState';

const News = () => {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;

  const { data, loading, error, refetch } = useApi(`/articles?page=${currentPage}&limit=${articlesPerPage}`);
  
  const articles = useMemo(() => {
    return data?.articles || [];
  }, [data]);

  const totalPages = useMemo(() => {
    return data?.pagination?.total || 1;
  }, [data]);

  const totalArticles = useMemo(() => {
    return data?.pagination?.totalArticles || 0;
  }, [data]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ''); // Supprime les balises HTML
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading && articles.length === 0) {
    return (
      <section className={styles.newsContainer}>
        <h2>
          <AnimatedText deps={[i18n.language]}>
            {t('news.title')}
          </AnimatedText>
        </h2>
        <ErrorState
          type="loading"
          emoji="📰"
          message={t('articlesSection.loadingTitle')}
        />
      </section>
    );
  }

  if (error && articles.length === 0) {
    return (
      <section className={styles.newsContainer}>
        <h2>
          <AnimatedText deps={[i18n.language]}>
            {t('news.title')}
          </AnimatedText>
        </h2>
        <ErrorState
          type="error"
          emoji="❌"
          message={t('articlesSection.errorTitle')}
          buttonText={t('articlesSection.retry')}
          onRetry={refetch}
        />
      </section>
    );
  }

  return (
    <section className={styles.newsContainer}>
      <h2>
        <AnimatedText deps={[i18n.language]}>
          {t('news.title')}
        </AnimatedText>
      </h2>
      
      {articles.length === 0 ? (
        <div className={styles.noArticles}>
          <p>
            <AnimatedText deps={[i18n.language]}>
              {t('news.none')}
            </AnimatedText>
          </p>
        </div>
      ) : (
        <div>
          {articles.map((article, index) => (
            <React.Fragment key={article._id}>
              <div className={styles.singleCard}>
                <Link to={`/news/${article.slug}`} className={styles.singleCardLink}>
                  <img 
                    src={article.image && ImageService.isDbImage(article.image) 
                      ? ImageService.getImageUrl(article.image.split('/').pop())
                      : article.image || AssetService.getDefaultArticleFallback()
                    } 
                    alt={article.title}
                    className={styles.singleCardImg}
                    onError={(e) => {
                      // Protection contre les boucles infinies
                      if (!e.target.dataset.errorHandled) {
                        e.target.dataset.errorHandled = 'true';
                        e.target.src = AssetService.getDefaultArticleFallback();
                      }
                    }}
                  />
                  
                  <div className={styles.singleCardOverlay}>
                    {article.secondaryImage && (
                      <img 
                        className={styles.singleCardCover} 
                        src={article.secondaryImage && ImageService.isDbImage(article.secondaryImage) 
                          ? ImageService.getImageUrl(article.secondaryImage.split('/').pop())
                          : article.secondaryImage
                        } 
                        alt="Cover image"
                        onError={(e) => {
                          if (!e.target.dataset.errorHandled) {
                            e.target.dataset.errorHandled = 'true';
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                    )}
                    
                    <div className={styles.singleCardContent}>
                      <div>
                        <h4 className={styles.singleCardTitle}>{article.title}</h4>
                        <span className={styles.singleKnowMoreButton}>
                          <AnimatedText deps={[i18n.language]}>
                            {t('news.readMore')}
                          </AnimatedText>
                        </span>
                      </div>
                      <span className={styles.singleCardDescription}>
                        {article.excerpt || getExcerpt(article.content)}
                      </span>
                      <div className={styles.singleCardMeta}>
                        <span className={styles.singleCardDate}>
                          <AnimatedText deps={[i18n.language]}>
                            {t('news.writtenOn', { date: formatDate(article.createdAt) })}
                          </AnimatedText>
                        </span>

                        {article.readingTime && (
                          <div className={styles.singleCardDuration}>
                            <span>{article.readingTime}</span>
                            <span className={styles.singleCardClock}>⏰</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              
              {index < articles.length - 1 && <div className={styles.newsDivider}></div>}
            </React.Fragment>
          ))}

          {/* Pagination */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </section>
  );
};

export default News; 
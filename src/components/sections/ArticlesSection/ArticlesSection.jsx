import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ArticleCarousel from '../../ui/ArticleCarousel/ArticleCarousel';
import ArticleGrid from '../../ui/ArticleGrid/ArticleGrid';
import AnimatedText from '../../ui/AnimatedText/AnimatedText';
import useApi from '../../../hooks/useApi';
import './ArticlesSection.css';
import { useTranslation } from 'react-i18next';
import ErrorState from '../../ui/ErrorState/ErrorState';

const ArticlesSection = () => {
  const { data, loading, error, refetch } = useApi('/articles?limit=3');
  const { t, i18n } = useTranslation();
  
  const articles = useMemo(() => {
    return data?.articles || [];
  }, [data]);

  if (loading && articles.length === 0) {
    return (
      <section className="articles-container-index">
        <h2 className="articles-title-index">
          <AnimatedText deps={[i18n.language]}>
            {t('articlesSection.title')}
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
      <section className="articles-container-index">
        <h2 className="articles-title-index">
          <AnimatedText deps={[i18n.language]}>
            {t('articlesSection.title')}
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
    <section className="articles-container-index">
      <h2 className="articles-title-index">
        <AnimatedText deps={[i18n.language]}>
          {t('articlesSection.title')}
        </AnimatedText>
      </h2>

      {articles.length > 0 ? (
        <div className={`articles-wrapper ${loading ? 'loading' : ''}`}>
          <ArticleCarousel articles={articles} />
          <ArticleGrid articles={articles} />
        </div>
      ) : (
        <div className="no-articles">
          <p>
            <AnimatedText deps={[i18n.language]}>
              {t('articlesSection.noArticlesText')}
            </AnimatedText>
          </p>
        </div>
      )}

      <div className={`see-all-articles ${loading ? 'loading' : ''}`}>
        <Link to="/news" className="see-all-link">
          <AnimatedText deps={[i18n.language]}>
            {t('articlesSection.seeAllLink')}
          </AnimatedText>
        </Link>
      </div>
    </section>
  );
};

export default React.memo(ArticlesSection);
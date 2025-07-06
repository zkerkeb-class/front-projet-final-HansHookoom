import React from 'react';
import { Link } from 'react-router-dom';
import ImageService from '../../../services/ImageService';
import AssetService from '../../../services/AssetService';
import ImageWithSkeleton from '../ImageWithSkeleton/ImageWithSkeleton';
import './ArticleGrid.css';

const ArticleGrid = ({ articles = [] }) => {
  if (!articles.length) return null;

  const handleImageError = (e) => {
    e.target.src = AssetService.getDefaultArticleFallback();
  };

  return (
    <div className="articles-grid-index">
      {articles.map((article, index) => {
        // Le premier article est affiché en grand
        const isMainCard = index === 0;
        const cardClass = isMainCard ? 'article-card-main-index' : 'article-card-index';
        const titleTag = isMainCard ? 'h3' : 'h4';

        return (
          <div key={article.id || index} className={cardClass}>
            <Link to={`/news/${article.slug}`} className="article-bg">
              <div className="article-image-container">
                <ImageWithSkeleton
                  src={article.image && ImageService.isDbImage(article.image) 
                    ? ImageService.getImageUrl(article.image.split('/').pop())
                    : article.image || AssetService.getDefaultArticleFallback()
                  }
                  alt={article.title}
                  fallbackSrc={AssetService.getDefaultArticleFallback()}
                  skeletonHeight="100%"
                  className="article-image"
                />
              </div>
              <div className="article-content">
                {titleTag === 'h3' ? (
                  <h3 className="article-title">{article.title}</h3>
                ) : (
                  <h4 className="article-title">{article.title}</h4>
                )}
                
                {isMainCard && article.excerpt && (
                  <p className="article-description">{article.excerpt}</p>
                )}
                
                <span className="know-more-button">Voir l'article</span>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(ArticleGrid);
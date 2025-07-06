import React, { useState, useEffect } from 'react';
import ImageService from '../../../services/ImageService';
import AnimatedText from '../../ui/AnimatedText/AnimatedText';
import styles from './ImageManager.module.css';
import { useTranslation } from 'react-i18next';

const ImageManager = ({ onImageSelect, selectedImage, showSelector = false, onClose }) => {
  const { t, i18n } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadImages();
  }, []);

  // Gérer le scroll du body pour éviter le double scroll
  useEffect(() => {
    // Bloquer le scroll du body quand le composant est monté
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Restaurer le scroll quand le composant est démonté
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const imageList = await ImageService.getImages();
      setImages(imageList);
    } catch (error) {
      console.error('Erreur chargement images:', error);
      setError(t('imageManager.loadError', { message: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError(t('imageManager.uploadTypeError'));
      return;
    }

    // Vérifier la taille (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError(t('imageManager.uploadSizeError'));
      return;
    }

    try {
      setUploading(true);
      setError('');
      const result = await ImageService.uploadImage(file);
      setSuccess(t('imageManager.uploadSuccess'));
      
      // Recharger la liste des images
      await loadImages();
      
      // Réinitialiser l'input
      event.target.value = '';
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur upload:', error);
      setError(t('imageManager.uploadError', { message: error.message }));
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageId) => {
    if (!window.confirm(t('imageManager.deleteConfirm'))) {
      return;
    }

    try {
      await ImageService.deleteImage(imageId);
      setSuccess(t('imageManager.deleteSuccess'));
      await loadImages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || t('imageManager.deleteError'));
    }
  };

  const handleImageSelect = (image) => {
    if (onImageSelect) {
      onImageSelect(`/api/images/${image.id}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Overlay pour bloquer les interactions avec l'arrière-plan */}
      <div className={styles.overlay}></div>
      
      <div className={styles.imageManager}>
        {/* Bouton de fermeture positionné en absolu */}
        {(onClose || showSelector) && (
          <button 
            onClick={onClose || (() => {})} 
            className={styles.closeButton}
            title={t('imageManager.close')}
          >
            ✕
          </button>
        )}
        
        <div className={styles.header}>
          <h3>
            <AnimatedText deps={[i18n.language]}>
              {t('imageManager.title')}
            </AnimatedText>
          </h3>
          <div className={styles.uploadSection}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className={styles.fileInput}
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className={styles.uploadButton}>
              <AnimatedText deps={[i18n.language]}>
                {uploading ? t('imageManager.uploading') : t('imageManager.upload')}
              </AnimatedText>
            </label>
          </div>
        </div>

      {error && <div className={styles.error}>
        <AnimatedText deps={[i18n.language]}>
          {error}
        </AnimatedText>
      </div>}
      {success && <div className={styles.success}>
        <AnimatedText deps={[i18n.language]}>
          {success}
        </AnimatedText>
      </div>}

      {loading ? (
        <div className={styles.loading}>
          <AnimatedText deps={[i18n.language]}>
            {t('imageManager.loading')}
          </AnimatedText>
        </div>
      ) : (
        <div className={styles.imageGrid}>
          {images.length === 0 ? (
            <div className={styles.noImages}>
              <AnimatedText deps={[i18n.language]}>
                {t('imageManager.noImages')}
              </AnimatedText>
            </div>
          ) : (
            images.map((image) => (
              <div 
                key={image.id} 
                className={`${styles.imageCard} ${
                  selectedImage === `/api/images/${image.id}` ? styles.selected : ''
                }`}
              >
                <div className={styles.imageWrapper}>
                  <img
                    src={ImageService.getImageUrl(image.id)}
                    alt={image.originalName}
                    className={styles.image}
                    loading="lazy"
                  />
                  {showSelector && (
                    <div 
                      className={styles.selectOverlay}
                      onClick={() => handleImageSelect(image)}
                    >
                      <span>
                        <AnimatedText deps={[i18n.language]}>
                          {t('imageManager.select')}
                        </AnimatedText>
                      </span>
                    </div>
                  )}
                </div>
                <div className={styles.imageInfo}>
                  <p className={styles.imageName} title={image.originalName}>
                    {image.originalName}
                  </p>
                  <p className={styles.imageSize}>{formatFileSize(image.size)}</p>
                  <div className={styles.imageActions}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleImageDelete(image.id)}
                    >
                      <AnimatedText deps={[i18n.language]}>
                        {t('imageManager.delete')}
                      </AnimatedText>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default ImageManager; 
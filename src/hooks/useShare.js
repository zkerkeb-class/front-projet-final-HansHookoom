const useShare = () => {
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('URL copiée dans le presse-papiers');
      return { status: 'copied', message: 'Lien copié dans le presse-papiers.' };
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
      if (error && error.name === 'NotAllowedError') {
        return { status: 'error', message: 'Impossible de copier le lien : la page n\'est pas active ou le navigateur a bloqué l\'accès au presse-papiers.' };
      }
      return { status: 'error', message: 'Erreur lors de la copie du lien.' };
    }
  };

  const share = async (url, title, description) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        console.log("Contenu partagé avec succès");
        return { status: 'success', message: 'Contenu partagé avec succès !' };
      } catch (error) {
        console.error("Erreur lors du partage:", error);
        if (error.name === 'AbortError') {
          // L'utilisateur a annulé le partage
          const copyResult = await copy(url);
          return { status: 'aborted', message: 'Partage annulé, lien copié dans le presse-papiers.' };
        } else {
          // Autre erreur
          const copyResult = await copy(url);
          return { status: 'error', message: 'Erreur lors du partage, lien copié dans le presse-papiers.' };
        }
      }
    } else {
      console.log("Web Share API non supportée, copie de l'URL");
      const copyResult = await copy(url);
      return { status: 'unsupported', message: 'Web Share API non supportée, lien copié dans le presse-papiers.' };
    }
  };

  return { copy, share };
};

export default useShare; 
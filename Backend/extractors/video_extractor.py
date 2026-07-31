import yt_dlp
from .base_extractor import BaseExtractor

class VideoExtractor(BaseExtractor):
    def __init__(self):
        # Options de base : on ne veut pas télécharger la vidéo, juste les infos textuelles
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
            'skip_download': True,
        }

    def extract_text(self, url):
        """
        Extrait le titre et la description d'une vidéo à partir de son URL.
        Fonctionne avec YouTube, TikTok, Instagram Reels, etc.
        """
        try:
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                # Récupération du dictionnaire de métadonnées
                info = ydl.extract_info(url, download=False)

                title = info.get('title', '')
                description = info.get('description', '')

                # On fusionne le titre et la description pour donner un maximum de contexte à spaCy
                full_text = f"{title}. {description}"

                print(f"Extraction réussie pour : {title}")
                return full_text

        except Exception as e:
            print(f"Erreur lors de l'extraction de {url} : {str(e)}")
            return None


# --- TEST ---
if __name__ == "__main__":
    extractor = VideoExtractor()

    test_url = "https://www.youtube.com/shorts/69orUBi41jw"

    texte_extrait = extractor.extract_text(test_url)

    print("\n--- TEXTE RÉCUPÉRÉ ---")
    print(texte_extrait)
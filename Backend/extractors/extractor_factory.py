from .video_extractor import VideoExtractor
from .instagram_image_extractor import ImageExtractor


class ExtractorFactory:
    @staticmethod
    def get_extractor(url: str):
        """Retourne la bonne classe d'extraction selon l'URL."""

        if "instagram.com/p/" in url:
            print("📸 Lien Instagram (Photo) détecté. Lancement de l'InstagramExtractor.")
            return ImageExtractor()

        elif "youtube.com" in url or "tiktok.com" in url or "instagram.com/reel/" in url:
            print("🎥 Lien Vidéo détecté. Lancement du VideoExtractor.")
            return VideoExtractor()

        else:
            raise ValueError("❌ Format d'URL non supporté par Omnisave pour le moment.")
import instaloader
from .base_extractor import BaseExtractor

class ImageExtractor(BaseExtractor):
    def __init__(self):
        # On initialise l'outil Instaloader
        self.loader = instaloader.Instaloader(
            quiet=True,
            download_pictures=False,
            download_video_thumbnails=False,
            download_comments=False,
            save_metadata=False
        )

    def extract_data(self, url):
        """
        Extrait la description d'un post photo Instagram à partir de son URL.
        """
        try:
            # 1. Nettoyage de l'URL pour récupérer le shortcode
            # On supprime d'abord les paramètres d'URL (comme ?img_index=1 pour les carrousels)
            clean_url = url.split('?')[0]

            # On retire le / final s'il existe, puis on coupe par les /
            url_parts = clean_url.rstrip("/").split("/")

            # Le shortcode est généralement le dernier élément
            shortcode = url_parts[-1]

            # 2. Récupération des données du post
            post = instaloader.Post.from_shortcode(self.loader.context, shortcode)

            # 3. Extraction de la légende (caption)
            description = post.caption if post.caption else ""

            author = post.owner_username

            thumbnail = post.url

            print(f"Extraction successful for post: {shortcode} by @{author}")

            # Return a complete dictionary of metadata
            return {
                "text": description,
                "author": author,
                "title": f"Post by @{author}",
                "thumbnail_url": thumbnail
            }


        except Exception as e:
            print(f"Error during Instagram extraction for {url} : {str(e)}")
            return None

# --- TEST ---
if __name__ == "__main__":
    extractor = ImageExtractor()

    # Test post Instagram (photo)
    test_url = "https://www.instagram.com/p/DbVK2BaS5x8/"

    texte_extrait = extractor.extract_text(test_url)

    print("\n--- TEXTE RÉCUPÉRÉ ---")
    print(texte_extrait)
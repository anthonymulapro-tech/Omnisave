import os

# Importation des deux modules "maison"
from extractors.video_extractor import VideoExtractor
from link_analyzer import LinkAnalyzer


def categorize_url(url):
    print(f"\n 1. Démarrage de l'analyse pour le lien : {url}")

    # 1. On initialise l'extracteur et on récupère le texte
    extractor = VideoExtractor()
    texte_extrait = extractor.extract_text(url)

    # Si la vidéo est privée ou le lien cassé, on arrête tout
    if not texte_extrait:
        print(" Erreur : Impossible d'extraire du texte de ce lien.")
        return "Erreur d'extraction"

    print(f" 2. Texte récupéré : '{texte_extrait}'")
    print(" 3. Envoi à l'IA (spaCy)...")

    # 2. On prépare le chemin vers le lexique JSON
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, 'data', 'lexicon.json')

    # 3. On initialise l'IA et on lance l'analyse
    analyzer = LinkAnalyzer(json_path)
    categorie_finale = analyzer.analyze(texte_extrait)

    print("-" * 50)
    print(f" RÉSULTAT : Cette vidéo parle de {categorie_finale.upper()} !")
    print("-" * 50)

    return categorie_finale


# --- TEST ---
if __name__ == "__main__":
    lien_test = "https://www.instagram.com/p/DaBQvjqOdK9/"

    categorize_url(lien_test)
import os

from link_analyzer import LinkAnalyzer
from extractors.extractor_factory import ExtractorFactory

def categorize_url(url):
    print(f"\n🚀 1. Démarrage de l'analyse pour le lien : {url}")

    try:
        # 1. On initialise l'extracteur et on récupère le texte
        extractor = ExtractorFactory.get_extractor(url)
        texte_extrait = extractor.extract_text(url)

        # Si la vidéo/photo est privée ou le lien cassé, on arrête tout
        if not texte_extrait:
            print("❌ Erreur : Impossible d'extraire du texte de ce lien.")
            return "Erreur d'extraction"

        print(f"✅ 2. Texte récupéré : '{texte_extrait}'")
        print("🤖 3. Envoi à l'IA (spaCy)...")

        # 2. On prépare le chemin vers le lexique JSON
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        json_path = os.path.join(base_dir, 'data', 'lexicon.json')

        analyzer = LinkAnalyzer(json_path, os.path.join(base_dir, 'data', 'blacklist.json'))
        ai_result = analyzer.analyze(texte_extrait)
        categories_finales = ai_result.get("categories", [])

        print("-" * 50)
        print(f"🎉 RÉSULTAT : Ce post parle de {', '.join(categories_finales).upper()} !")
        print("-" * 50)

        return categories_finales
    except Exception as e:
        print(f"❌ Erreur critique : {e}")
        return "Erreur"


# --- TEST ---
if __name__ == "__main__":
    lien_test = "https://www.instagram.com/p/DaBQvjqOdK9/"
    categorize_url(lien_test)
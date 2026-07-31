from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.link_analyzer import LinkAnalyzer
from backend.extractors.extractor_factory import ExtractorFactory  # <-- Nouvel import indispensable
import os

app = Flask(__name__)
CORS(app)

# Initialisation globale de l'IA (meilleur pour les performances)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(BASE_DIR, 'data', 'lexicon.json')
analyzer = LinkAnalyzer(json_path)


@app.route('/api/analyze', methods=['POST'])
def analyze_api():
    data = request.get_json()

    if not data or 'text_input' not in data:
        return jsonify({'error': 'Aucun lien fourni'}), 400

    url = data['text_input']

    print(f"\n--- NOUVELLE ANALYSE ---")
    print(f"🔗 1. Lien reçu de React : {url}")

    try:
        # --- LOGIQUE D'EXTRACTION ---
        print("🔍 2. Démarrage de l'extracteur...")
        extractor = ExtractorFactory.get_extractor(url)
        texte_extrait = extractor.extract_text(url)

        if not texte_extrait:
            print("❌ Erreur : Impossible d'extraire du texte de ce lien.")
            return jsonify(
                {'error': "Impossible d'extraire le contenu de ce lien (profil privé ou lien invalide)."}), 400

        # On limite l'affichage dans la console à 100 caractères pour que ça reste lisible
        print(f"✅ 3. Texte récupéré : '{texte_extrait[:100]}...'")
        print("🤖 4. Envoi à l'IA (spaCy)...")

        # --- LOGIQUE D'ANALYSE ---
        category = analyzer.analyze(texte_extrait)

        print(f"🎯 5. Catégorie trouvée : {category}")
        print(f"------------------------\n")

        return jsonify({'category': category}), 200

    except Exception as e:
        print(f"❌ Erreur critique : {e}")
        return jsonify({'error': "Une erreur est survenue lors du traitement."}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
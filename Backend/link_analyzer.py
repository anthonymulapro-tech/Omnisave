import json
import spacy
import os


class LinkAnalyzer:
    def __init__(self, json_path):
        """Initialise l'analyseur en chargeant le lexique et le modèle IA."""
        with open(json_path, 'r', encoding='utf-8') as file:
            self.lexicon = json.load(file)

        print("Chargement du modèle NLP spaCy (fr_core_news_sm)...")
        self.nlp = spacy.load("fr_core_news_sm")

    def _log_unknown_words(self, doc):
        """
        Extrait les mots pertinents d'un document non catégorisé et les sauvegarde.
        """
        mots_utiles = set()

        for token in doc:
            # On ne garde que les Noms, Noms Propres et Verbes (sans les Stop Words)
            if token.pos_ in ['NOUN', 'PROPN', 'VERB'] and not token.is_stop and token.is_alpha:
                mots_utiles.add(token.lemma_.lower())

        if mots_utiles:
            # Sauvegarde dans le même dossier que ce script
            filepath = os.path.join(os.path.dirname(__file__), "unknown_words.txt")
            with open(filepath, "a", encoding="utf-8") as f:
                f.write(f"--- Mots extraits d'un post NON CATÉGORISÉ ---\n")
                f.write(", ".join(mots_utiles) + "\n\n")

    def analyze(self, text):
        """Analyse le texte et retourne la catégorie gagnante en utilisant la grammaire."""
        scores = {category: 0 for category in self.lexicon.keys()}

        doc = self.nlp(text)

        for token in doc:
            if token.is_punct or token.is_space:
                continue

            mot_racine = token.lemma_.lower()
            role_grammatical = token.dep_

            # Multiplicateur syntaxique
            multiplicateur_grammaire = 1.0
            if role_grammatical in ["ROOT", "nsubj", "nsubj:pass"]:
                multiplicateur_grammaire = 1.5
            elif role_grammatical in ["obl"]:
                multiplicateur_grammaire = 0.5

            # Calcul des points depuis le JSON
            for category, data in self.lexicon.items():
                coef = data.get("coefficient", 1.0)

                for group_name, group_data in data.get("groups", {}).items():
                    points = group_data["points"]
                    words = [w.lower() for w in group_data["words"]]

                    if mot_racine in words:
                        scores[category] += (points * coef * multiplicateur_grammaire)

        best_category = self._determine_winner(scores)

        # Si aucune catégorie n'est trouvée, on lance le Shadow Logging
        if best_category == "Non catégorisé":
            self._log_unknown_words(doc)

        return best_category

    def _determine_winner(self, scores):
        """Trouve la catégorie avec le plus haut score, avec un seuil de sécurité."""
        seuil_minimum = 50

        # On trouve la catégorie qui a le plus de points
        best_category = max(scores, key=scores.get)
        best_score = scores[best_category]

        # Si le meilleur score n'atteint pas le seuil, on refuse de catégoriser
        if best_score < seuil_minimum:
            return "Non catégorisé"

        return best_category


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, 'data', 'lexicon.json')

    analyzer = LinkAnalyzer(json_path)

    print("\n--- RÉSULTATS DES TESTS ---")

    print("Test 1 :", analyzer.analyze("La restauration est super ici!"))
    print("Test 2 :", analyzer.analyze("La nouvelle recette pour mon entraînement en musculation!"))
    print("Test 3 :", analyzer.analyze("Mon entraînement est savoureux, remplis de saveur, je finis pas cuit à la fin"))
    print("Test 4 :", analyzer.analyze("Les recettes de mon entreprise en 2025"))
    print("Test 5 :", analyzer.analyze("On a eu chaud mais les recettes de 2025 sont arrivé, et mon entreprise est rentable"))
    print("Test 6 :", analyzer.analyze("La recette pour un entraînement réussis passe par la régularité des séances de sport"))

    print("\n--- TEST PIÈGE ULTIME ---")

    phrase = "Nouvelle vidéo d'entraînement pour la musculation a combiner avec mon autre vidéo sur les recettes"
    print(f"Phrase 1 : '{phrase}'")
    print(f"Catégorie détectée : {analyzer.analyze(phrase).upper()}")

    phrase ="Avant mon entraînement de musculation, je prépare une recette rapide avec peu d'ingrédients."
    print(f"Phrase 2 : '{phrase}'")
    print(f"Catégorie détectée : {analyzer.analyze(phrase).upper()}")

    phrase ="J'ai investi mon salaire dans un restaurant pour lancer une nouvelle entreprise de gastronomie."
    print(f"Phrase 3 : '{phrase}'")
    print(f"Catégorie détectée : {analyzer.analyze(phrase).upper()}")

    phrase = "Le coût de mon abonnement en salle de sport pèse lourd sur mon budget mensuel et mon épargne."
    print(f"Phrase 4 : '{phrase}'")
    print(f"Catégorie détectée : {analyzer.analyze(phrase).upper()}")

    phrase = "Préparer son équipement physique bien au chaud avant de courir sous la pluie."
    print(f"Phrase 5 : '{phrase}'")
    print(f"Catégorie détectée : {analyzer.analyze(phrase).upper()}")
import json
import spacy
import os

# 1. Chargement de l'IA et du JSON
print("Chargement du modèle spaCy...")
nlp = spacy.load("fr_core_news_sm")

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
json_path = os.path.join(base_dir, 'data', 'lexicon.json')

with open(json_path, 'r', encoding='utf-8') as file:
    lexicon = json.load(file)

# 2. phrase test
phrase = "Avant mon entraînement de musculation, je prépare une recette rapide avec peu d'ingrédient"
print(f"\nANALYSE DE LA PHRASE : '{phrase}'")
print("-" * 60)

doc = nlp(phrase)
scores = {category: 0 for category in lexicon.keys()}

# 3. L'autopsie mot par mot
print(f"{'MOT ORIGINAL':<15} | {'RACINE (LEMMA)':<15} | {'ROLE (DEP)':<10} | {'MULTIPLICATEUR':<15}")
print("-" * 60)

for token in doc:
    if token.is_punct or token.is_space:
        continue

    mot_racine = token.lemma_.lower()
    role_grammatical = token.dep_

    multiplicateur = 1.0
    if role_grammatical in ["ROOT", "nsubj", "nsubj:pass"]:
        multiplicateur = 1.5
    elif role_grammatical in ["obl"]:
        multiplicateur = 0.5

    print(f"{token.text:<15} | {mot_racine:<15} | {role_grammatical:<10} | x{multiplicateur}")

    # Calcul des points
    for category, data in lexicon.items():
        coef = data.get("coefficient", 1.0)
        for group_name, group_data in data.get("groups", {}).items():
            words = [w.lower() for w in group_data["words"]]
            if mot_racine in words:
                points_gagnes = group_data["points"] * coef * multiplicateur
                scores[category] += points_gagnes
                print(f"  >>> +{points_gagnes} pts pour {category.upper()} (Mot clé: {mot_racine})")

print("-" * 60)
print("SCORE FINAL :")
for cat, score in scores.items():
    print(f"{cat.upper():<10} : {score} points")
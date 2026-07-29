import spacy

# 1. Chargement du français
print("Chargement du modèle français...")
nlp = spacy.load("fr_core_news_sm")

# 2. Phrase test
phrase_test = "Les créateurs de contenus cuisinaient des plats délicieux et s'entraînaient tous les jours !"

# 3. Analyse de la phrase par l'IA
document = nlp(phrase_test)

# 4. Affichage du résultat de la lemmatisation (la réduction à la racine)
print("\n--- ANALYSE DE LA PHRASE ---")
for mot in document:
    # Exclusion de la ponctuation et des espaces pour y voir plus clair
    if not mot.is_punct and not mot.is_space:
        print(f"Mot original : {mot.text:15} -> Racine trouvée : {mot.lemma_}")
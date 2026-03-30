import re
# Dictionnaire avec catégorie et mots-clés
lexique = {
    "Cuisine": {
        "Master": ["recette", "cuisson"],
        "High": ["delicieux", "saveur"]
    },
    "Sport": {
        "Master": ["entrainement", "musculation"],
        "High": ["cardio", "performance"]
    }
}

# système de scoring à l'aide du dictionnaire "lexique"
def analyse_texte(texte):
    global scores
    scores = {"Cuisine": 0, "Sport": 0}
    texte_min = texte.lower()
    mots = re.findall(r'\w+', texte_min)

    for mot in mots:
        # On teste pour la CUISINE
        if mot in lexique["Cuisine"]["Master"]:
            scores["Cuisine"] += 50
        elif mot in lexique["Cuisine"]["High"]:
            scores["Cuisine"] += 20

        # On teste pour le SPORT
        if mot in lexique["Sport"]["Master"]:
            scores["Sport"] += 50
        elif mot in lexique["Sport"]["High"]:
            scores["Sport"] += 20

    # Choix de la catégorie final
    if scores["Cuisine"] > scores["Sport"]:
        return "Cuisine"
    elif scores["Sport"] == scores["Cuisine"]:
        return "Cuisine"
    else:
        return "Sport"


# Test
test_1 = print(analyse_texte("une recette pour mon entrainement"))
scores_1 = print(f"Détail des scores : {scores}")

test_2 = print(analyse_texte("une Recette pour mon entrainement"))
scores_2 = print(f"Détail des scores : {scores}")

test_3 = print(analyse_texte("une CUISSON parfaite !"))
scores_3 = print(f"Détail des scores : {scores}")
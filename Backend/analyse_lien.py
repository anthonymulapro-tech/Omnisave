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

scores = {"Cuisine": 0, "Sport": 0}

# système de scoring à l'aide du dictionnaire "lexique"
def analyse_texte(texte):
    global scores
    mots = texte.split()

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
socre_1 = print(f"Détail des scores : {scores}")

test_2 = print(analyse_texte("une Recette pour mon entrainement"))
socre_2 = print(f"Détail des scores : {scores}")
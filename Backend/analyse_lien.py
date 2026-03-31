import re
# Création de la classe primaire, de notre objet
class AnalyseLien:
    # Constructeur : initialise l'objet avec son lexique et ses scores
    def __init__(self):
        # Définition des attributs de l'instance
        self.lexique = {
            "Cuisine": {
                "Master": ["recette", "cuisson"],
                "High": ["delicieux", "saveur"]
            },
            "Sport": {
                "Master": ["entrainement", "musculation"],
                "High": ["cardio", "performance"]
            }
        }
        # Initialisation des scores à zéro à chaque création d'objet
        self.scores = {"Cuisine": 0, "Sport": 0}

    def analyse_texte(self, texte):
        # Les scores sont remis à zéro pour une nouvelle analyse avec le même objet
        self.scores = {"Cuisine": 0, "Sport": 0}
        # Passage du texte en minusculue et extraction des mots sans ponctuation
        texte_min = texte.lower()
        mots = re.findall(r'\w+', texte_min)

        for mot in mots:
            # Test Cuisine
            if mot in self.lexique["Cuisine"]["Master"]:
                self.scores["Cuisine"] += 50
            elif mot in self.lexique["Cuisine"]["High"]:
                self.scores["Cuisine"] += 20

            # Test Sport
            if mot in self.lexique["Sport"]["Master"]:
                self.scores["Sport"] += 50
            elif mot in self.lexique["Sport"]["High"]:
                self.scores["Sport"] += 20

        # Choix catégorie final
        if self.scores["Cuisine"] >= self.scores["Sport"]:
            return "Cuisine"
        else:
            return "Sport"


# Création de l'instance
analyse = AnalyseLien()

# 2. Premier test
resultat_1 = analyse.analyse_texte("une recette pour mon entrainement")
print(f"Test 1 : {resultat_1} | Scores : {analyse.scores}")

# 3. Deuxième test (Les scores repartent de zéro grâce à la méthode POO)
resultat_2 = analyse.analyse_texte("Mélanger musculation et performance")
print(f"Test 2 : {resultat_2} | Scores : {analyse.scores}")
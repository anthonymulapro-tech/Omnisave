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

    # Passage du texte en minusculue et extraction des mots sans ponctuation
    def nettoyer_texte(self, texte):
        return re.findall(r'\w+', texte.lower())

    # Calcul dynamique des scores en fonction du lexique
    def calculer_scores(self, mots):
        # Initialisation des scores pour chaque analyse
        scores = {"Cuisine": 0, "Sport": 0}
        for mot in mots:
            # Parcours dynamique des catégories et leurs niveaux
            for cat, niveaux in self.lexique.items():
            # Test Cuisine
             if mot in niveaux["Master"]:
                scores[cat] += 50
             elif mot in niveaux["High"]:
                scores[cat] += 20
        return scores

    # Choix de la catégorie dominante
    def trancher_vainqueur(self, points):
        if max(points.values()) == 0:
            return None

        if points["Cuisine"] >= points["Sport"]:
            return "Cuisine"

        else:
            return "Sport"

    # Coordinateur des étapes de l'analyse
    def analyser(self,texte):
        mots = self.nettoyer_texte(texte)
        points = self.calculer_scores(mots)
        resultat = self.trancher_vainqueur(points)


        print(f"--- ANALYSE TERMINEE ---")
        print(f"Texte analysé : '{texte}'")
        print(f"Scores obtenus : {points}")
        if resultat is None:
            print(f"Nous n'avons pas trouvé de mots clés associés aux catégories présente, veuillez ajouter le/les mots clés dans la catégorie concernée ou bien ajouter une nouvelle catégorie ")
        else:
            print(f"Résultat final : {resultat}")
        print("------------------------\n")
        return resultat

# Création de l'instance
test = AnalyseLien()

# TEST
test.analyser("Le restaurant est super ici!")
test.analyser("La recette est incroyable")

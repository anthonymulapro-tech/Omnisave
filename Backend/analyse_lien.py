import re
import json
# Création de la classe primaire, de notre objet
class AnalyseLien:
    # Constructeur : initialise l'objet via le fichier JSON
    def __init__(self, chemin_json):
        self.lexique = self._charger_lexique(chemin_json)

    # Méthode privé pour l'ouverture du fichier et gestion d'erreur si non trouvé
    def _charger_lexique(self, chemin):
        try:
            with open(chemin, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"[ERREUR CRITIQUE] Le fichier {chemin} est introuvable.")
            return None

    # Passage du texte en minusculue et extraction des mots sans ponctuation
    def nettoyer_texte(self, texte):
        return re.findall(r'\w+', texte.lower())

    # Calcul dynamique des scores en fonction du lexique
    def calculer_scores(self, mots):
        # Retourne les deux dictionnaires, traçabilité entre le comptage brut et le score pondéré.
        if self.lexique is None: return {}, {}
        # Initialisation des scores pour chaque analyse
        scores_brut = {cat: 0 for cat in self.lexique.keys()}

        for mot in mots:
            # Parcours dynamique des catégories et de leurs niveaux
            for cat, config in self.lexique.items():
                # Utilisation de .get() pour éviter les erreurs "KeyError" si la clé n'existe pas
                mot_cles = config.get("mot_cles", {})
            # Pondération spécifique aux mots clés plus important qui sont sources d'erreur d'analyse
                if mot in mot_cles.get("master", []):
                    if mot == "recette":
                        scores_brut[cat] += 150
                    elif mot == "entreprise":
                        scores_brut[cat] += 100
                    else:
                        scores_brut[cat] += 50
                elif mot in mot_cles.get("high", []):
                    scores_brut[cat] += 20

        scores_final = {}
        for cat, points in scores_brut.items():
            # Ajout du coefficient propre à chaque catégorie pour plus de précision
            coef = self.lexique[cat].get("coefficient", 1.0)
            scores_final[cat] = round(points * coef, 2)
        return scores_brut, scores_final

    # Choix de la catégorie dominante
    def trancher_vainqueur(self, points):
        if not points or max(points.values()) == 0:
            return None
        # variable supplémentaire pour la nouvelle condition
        vainqueur_par_score = max(points, key=points.get)
        score_max = points[vainqueur_par_score]

        c = points.get("cuisine", 0)
        s = points.get("sport", 0)

        # La nouvelle condition permet de déterminer plus efficacement le vainqueur
        if c > 0 and c >= s:
            if score_max > c:
                return vainqueur_par_score
            return "cuisine"
        return vainqueur_par_score

    # Coordinateur des étapes de l'analyse
    def analyser(self,texte):
        if self.lexique is None:
            print("ERREUR SYSTEME : Impossible de réaliser l'analyse (lexique absent).")
            return "ERREUR_SYSTEME"

        # Traitement
        mots = self.nettoyer_texte(texte)
        scores_brut, scores_final = self.calculer_scores(mots)
        resultat = self.trancher_vainqueur(scores_final)

        # Affichage
        print(f"--- ANALYSE TERMINEE ---")
        print(f"Texte analysé : '{texte}'")
        print(f"Scores brut : {scores_brut}")
        print(f"Scores final : {scores_final}")

        if resultat is None:
            print(f"Nous n'avons pas trouvé de mots-clés associés aux catégories présente, veuillez ajouter le/les mots clés dans les catégories ou bien ajouter une nouvelle catégorie ")
        else:
            print(f"Résultat final : {resultat}")
        print("------------------------\n")
        return resultat

# Création de l'instance
test = AnalyseLien("lexique.json")

# TEST
test.analyser("Le restaurant est super ici!")
test.analyser("La nouvelle recette pour mon entraînement en musculation!")
test.analyser("Mon entraînement est savoureux, remplis de saveur, je finis pas cuit à la fin")
test.analyser("Recette de mon entreprise en 2025")

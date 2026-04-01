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
    def nettoyeur_texte(self, texte):
        return re.findall(r'\w+', texte.lower())

    # Calcul dynamique des scores en fonction du lexique
    def calculer_scores(self, mots):
        if self.lexique is None: return {}
        # Initialisation des scores pour chaque analyse
        scores = {cat: 0 for cat in self.lexique.keys()}
        for mot in mots:
            # Parcours dynamique des catégories et de leurs niveaux
            for cat, niveaux in self.lexique.items():
                # Utilisation de .get() pour éviter les erreurs "KeyError" si la clé n'existe pas
                if mot in niveaux.get("master", []):
                    scores[cat] += 50
                elif mot in niveaux.get("high", []):
                    scores[cat] += 20
        return scores

    # Choix de la catégorie dominante
    def trancher_vainqueur(self, points):
        if not points or max(points.values()) == 0:
            return None
        # Priorité en cas d'égalité
        if points.get("cuisine", 0) >= points.get("sport", 0):
            return "cuisine"
        else:
            return "sport"

    # Coordinateur des étapes de l'analyse
    def analyser(self, texte):
        if self.lexique is None:
            print("ERREUR SYSTEME : Impossible de réaliser l'analyse (lexique absent).")
            return "ERREUR_SYSTEME"

        # Traitement
        mots = self.nettoyeur_texte(texte)
        points = self.calculer_scores(mots)
        resultat = self.trancher_vainqueur(points)

        # Affichage
        print(f"--- ANALYSE TERMINEE ---")
        print(f"Texte analysé : '{texte}'")
        print(f"Scores obtenus : {points}")

        if resultat is None:
            print(f"Nous n'avons pas trouvé de mots clés associés aux catégories présentes.")
        else:
            print(f"Résultat final : {resultat}")
        print("------------------------\n")
        return resultat

# Création de l'instance
test = AnalyseLien("lexique.json")

# TEST
test.analyser("La nouvelle recette est super!")
test.analyser("La recette est parfaite pour ma pratique en musculation !")

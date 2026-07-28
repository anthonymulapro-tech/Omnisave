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
        # On utilise [a-zà-ÿ] pour garder les accents et {3,} pour ignorer les mots de moins de 3 lettres
        return re.findall(r'[a-zà-ÿ]{3,}', texte.lower())

    def _creer_pattern_flexible(self, mot_cle):
        #Fonction pour détecter les mots avec accents et également les pluriels.
        p = mot_cle.lower()
        # Remplacement des voyelles par des classes de caractères (Accents)
        p = p.replace('e', '[eéèêë]')
        p = p.replace('i', '[iîï]')
        p = p.replace('a', '[aàâä]')
        p = p.replace('u', '[uûüù]')
        # Ajout de la règle du pluriel facultatif (s, x, es) dans le regex final
        return rf"^{p}(s|x|es)?$"

    # Calcul dynamique des scores en fonction du lexique
    def calculer_scores(self, mots_extraits):
        # Retourne les deux dictionnaires, traçabilité entre le comptage brut et le score pondéré.
        if self.lexique is None: return {}, {}
        # Initialisation des scores pour chaque analyse
        scores_brut = {cat: 0 for cat in self.lexique.keys()}

        #  Piochage de chaque mot brut trouvé dans le texte
        for mot_brut in mots_extraits:
            for cat, config in self.lexique.items():
                # Utilisation de .get() pour éviter les erreurs "KeyError" si la clé n'existe pas
                dictionnaire_reference = config.get("mot_cles", {})

                for niveau, liste_mots in dictionnaire_reference.items():
                    for mot_cle in liste_mots:
                        # Création du pattern basé sur le mot "propre" du JSON
                        pattern = self._creer_pattern_flexible(mot_cle)

                        # Pondération spécifique au mot clé plus important "recette" qui est source d'erreur d'analyse
                        if re.fullmatch(pattern, mot_brut):
                            if mot_cle == "recette":
                                scores_brut[cat] += 150
                            elif mot_cle == "entreprise":
                                scores_brut[cat] += 100
                            else:
                                scores_brut[cat] += 50 if niveau == "master" else 20
                            break  # Match trouvé, on arrête de chercher pour ce mot_brut dans cette catégorie
        scores_final = {}
        for cat, points in scores_brut.items():
            # Ajoute du coefficient propre à chaque catégorie pour plus de précision
            coef = self.lexique[cat].get("coefficient", 1.0)
            scores_final[cat] = round(points * coef, 2)
        return scores_brut, scores_final

    # Choix de la catégorie dominante
    def trancher_vainqueur(self, points):
        if not points or max(points.values()) == 0:
            return None
        # variable supplémentaire pour la nouvelle condition
        vainqueur_par_score = max(points, key=points.get)
        c = points.get("cuisine", 0)
        s = points.get("sport", 0)

        # La nouvelle condition permet de déterminer plus efficacement le vainqueur
        if c > 0 and c >= s:
            if points[vainqueur_par_score] > c:
                return vainqueur_par_score
            return "cuisine"
        return vainqueur_par_score

    # Coordinateur des étapes de l'analyse
    def analyser(self,texte):
        if self.lexique is None:
            print("ERREUR SYSTEME : Impossible de réaliser l'analyse (lexique absent).")
            return "ERREUR_SYSTEME"

        # Traitement
        mots_extrait = self.nettoyer_texte(texte)
        scores_brut, scores_final = self.calculer_scores(mots_extrait)
        resultat = self.trancher_vainqueur(scores_final)

        # Affichage
        print(f"--- ANALYSE TERMINEE ---")
        print(f"Texte analysé : '{texte}'")
        print(f"Scores brut : {scores_brut}")
        print(f"Scores final : {scores_final}")

        if resultat is None:
            print(f"Nous n'avons pas trouvé de mots clés associés aux catégories présente, veuillez ajouter le/les mots clés dans les catégories ou bien ajouter une nouvelle catégorie ")
        else:
            print(f"Résultat final : {resultat}")
        print("------------------------\n")
        return resultat

# Création de l'instance
test = AnalyseLien("../data/lexique.json")

# TEST
test.analyser("Le restaurant est super ici!")
test.analyser("La nouvelle recette pour mon entraînement en musculation!")
test.analyser("Mon entraînement est savoureux, remplis de saveur, je finis pas cuit à la fin")
test.analyser("Les recettes de mon entreprise en 2025")
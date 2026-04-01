# Projet Omnisave


## Vision du projet :
Omnisave est une plateforme pour réunir en un seul endroit tout les contenus que nous enregistrons dans nos bibliothèques et collections sur les **différents réseau sociaux**.
La différence ici c'est qu'en envoyant le lien sur le site, l'algorithme détecte directement des mots clés, attribut un score non visible par l'utilisateur et **classe automatiquement** le contenu dans la bonne catégorie.
Ici on stock uniquement **l'URL**, on créer une redirection vers le contenu original sur la platefome d'origine.
Ce choix technique permet d'éviter d'éventuels problèmes liés au **RGPD** et au respect du droit d'auteur, en ne pratiquant aucun stockage ni téléchargement définitif du contenu sur le site.
En conséquence, si le créateur supprime la source originale sur son réseau social, le lien deviendra également obsolète sur Omnisave, garantissant ainsi le **respect du droit d'auteur**.



## Avancement des versions :
V0.1.0 : 
- Architecture de base (Backend/Frontend).
- Concentration sur Python.
- Premier prototype de classification par mots-clés.
- Algorithme de scoring initial en Python.

VO.2.0 :
- Implémentation d'un regex simple.
- Passage du texte à analyser en minuscule.
- Déplacement de la variable "scores" en global dans la fonction, donc en local pour éviter un cumul de score.

V0.3.0 :
- Refactorisation en POO
- Création de la classe AnalyseLien (Encapsulation).
- Gestion des attributs d'instance pour isoler les données.

V0.3.5 :
- Découpage en plusieurs fonction.
- Algorithme dynamique pour les boucles.
- Gestion d'erreur avec l'ajout d'un résultat nul.

V0.4.0 :
- Création d'un fichier JSON pour une gestion indépendante du code source.
- Gestion d'erreur avec un bloc try/execpt en cas d'échec d'ouverture du fichier.
- Gestion d'erreur avec méthode .get concernant les KeyError si une clé est manquante dans le dictionnaire.
- Affichage différent pour l'utilisateur si c'est une erreur système ou mots non trouvés.
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


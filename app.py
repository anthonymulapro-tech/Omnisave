from flask import Flask, render_template
from Backend.analyse_lien import AnalyseLien
import os

# On configure Flask pour qu'il trouve tes dossiers Frontend personnalisés
app = Flask(__name__,
            template_folder='Frontend/templates',
            static_folder='Frontend/static')

# On construit le chemin sécurisé vers le fichier JSON
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(BASE_DIR, 'data', 'lexique.json')

# On initialise ton analyseur
analyseur = AnalyseLien(json_path)

# On crée la route principale (la page d'accueil)
@app.route('/')
def index():
    # On demande à Flask d'afficher ton fichier HTML
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
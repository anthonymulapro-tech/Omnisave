from flask import Flask, render_template
from Backend.link_analyzer import LinkAnalyzer
import os

app = Flask(__name__,
            template_folder='Frontend/templates',
            static_folder='Frontend/static')
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(BASE_DIR, 'data', 'lexicon.json')

analyzer = LinkAnalyzer(json_path)

# Route principale (page d'accueil)
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
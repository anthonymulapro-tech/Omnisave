from flask import Flask, render_template, request
from backend.link_analyzer import LinkAnalyzer
import os

app = Flask(__name__,
            template_folder='frontend/templates',
            static_folder='frontend/static')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(BASE_DIR, 'data', 'lexicon.json')

analyzer = LinkAnalyzer(json_path)

# Route principal
@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    if request.method == 'POST':
        user_text = request.form.get('text_input')
        if user_text:
            result = analyzer.analyze(user_text)

    return render_template('index.html', result=result)


if __name__ == '__main__':
    app.run(debug=True)
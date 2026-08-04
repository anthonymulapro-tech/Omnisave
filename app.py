from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# --- Imports for AI Link Analysis ---
from backend.link_analyzer import LinkAnalyzer
from backend.extractors.extractor_factory import ExtractorFactory

# --- Imports for Database & Models ---
from models.user import User
from repositories.user_repository import UserRepository

# --- Imports services ---
from services.auth_service import AuthService

app = Flask(__name__)
CORS(app)

# ==========================================
# AI INITIALIZATION
# ==========================================
# Global initialization of the AI (better for performance)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(BASE_DIR, 'data', 'lexicon.json')
analyzer = LinkAnalyzer(json_path)

# ==========================================
# API ENDPOINTS (ROUTES)
# ==========================================

import logging

# Configuration professionnelle des logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [%(levelname)s] - %(message)s')

@app.route('/api/users', methods=['POST'])
def create_user():
    """
    Endpoint to create a new user in the database.
    """
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        logging.warning("User creation failed: Missing email or password")
        return jsonify({"error": "Email and password are required"}), 400

    logging.info(f"Processing new user creation for: {data.get('email')}")
    hashed_password = AuthService.hash_password(data['password'])

    new_user = User(
        email=data['email'],
        password=hashed_password,
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        country=data.get('country')
    )

    saved_user = UserRepository.create(new_user)

    if saved_user:
        logging.info(f"Successfully created user with ID: {saved_user.user_id}")
        return jsonify({
            "message": "User successfully created",
            "user": saved_user.to_dict()
        }), 201
    else:
        logging.error(f"Database insertion failed for user: {data.get('email')}")
        return jsonify({"error": "Failed to create user in the database"}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Endpoint to authenticate a user.
    """
    data = request.get_json()

    # Basic field validation
    if not data or not data.get('email') or not data.get('password'):
        logging.warning("Login failed: Missing email or password")
        return jsonify({"error": "Email and password are required"}), 400

    email = data['email']
    password_attempt = data['password']

    logging.info(f"Login attempt for email: {email}")

    # 1. Ask the Repository to find the user (Separation of concerns: Database)
    user = UserRepository.get_by_email(email)

    if not user:
        # We never expose "Email not found" for security reasons (prevents username enumeration)
        logging.warning(f"Login failed: User not found for email {email}")
        return jsonify({"error": "Invalid credentials"}), 401

    # 2. Ask the Service to verify the password (Separation of concerns: Security)
    if not AuthService.verify_password(user.password, password_attempt):
        logging.warning(f"Login failed: Incorrect password for email {email}")
        return jsonify({"error": "Invalid credentials"}), 401

    # 3. Success (Controller response)
    logging.info(f"Successful login for user ID: {user.user_id}")
    return jsonify({
        "message": "Login successful",
        "user": user.to_dict()
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_api():
    """
    Endpoint to analyze a URL and detect its category using AI (spaCy).
    """
    data = request.get_json()

    if not data or 'text_input' not in data:
        logging.warning("Analysis failed: No link provided in the request payload")
        return jsonify({'error': 'No link provided'}), 400

    url = data['text_input']
    logging.info(f"Starting analysis for link: {url}")

    try:
        # --- EXTRACTION LOGIC ---
        logging.info("Initializing the appropriate extractor...")
        extractor = ExtractorFactory.get_extractor(url)
        extracted_text = extractor.extract_text(url)

        if not extracted_text:
            logging.warning(f"Extraction failed: Cannot extract content from {url} (private profile or invalid).")
            return jsonify({
                'error': "Cannot extract content from this link (private profile or invalid link)."
            }), 400

        # Limit console output to 100 characters for readability
        logging.info(f"Text successfully retrieved. Snippet: '{extracted_text[:100]}...'")
        logging.info("Sending text to AI analyzer (spaCy)...")

        # --- ANALYSIS LOGIC ---
        category = analyzer.analyze(extracted_text)

        logging.info(f"Analysis complete. Category detected: {category}")

        return jsonify({'category': category}), 200

    except Exception as e:
        logging.error(f"Critical error during link analysis: {e}")
        return jsonify({'error': "An error occurred during processing."}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
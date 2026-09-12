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
from backend.services.auth_service import AuthService, token_required

# --- Imports repositories ---
from models.link import Link
from repositories.category_repository import CategoryRepository
from repositories.link_repository import LinkRepository

app = Flask(__name__)
CORS(app)

# ==========================================
# AI INITIALIZATION
# ==========================================
# Global initialization of the AI (better for performance)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

lexicon_path = os.path.join(BASE_DIR, 'data', 'lexicon.json')
blacklist_path = os.path.join(BASE_DIR, 'data', 'blacklist.json')

analyzer = LinkAnalyzer(lexicon_path, blacklist_path)
# ==========================================
# API ENDPOINTS (ROUTES)
# ==========================================

import logging

# Configuration professionnelle des logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [%(levelname)s] - %(message)s')


@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """
    Endpoint to register a new user.
    """
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        logging.warning("Registration failed: Missing email or password")
        return jsonify({"error": "Email and password are required"}), 400

    email = data['email']
    password_attempt = data['password']

    # --- Prevent duplicate accounts ---
    # Check if the requested email is already registered in the database
    existing_user = UserRepository.get_by_email(email)
    if existing_user:
        logging.warning(f"Registration failed: Email {email} already in use")
        return jsonify({"error": "Cet email est déjà utilisé"}), 409

    # --- Backend Password Strength Validation ---
    if not AuthService.is_password_strong(password_attempt):
        logging.warning(f"Registration failed: Weak password provided for {email}")
        return jsonify({
            "error": "Le mot de passe est trop faible. Il doit contenir 8 caractères, une majuscule, un chiffre et un caractère spécial."
        }), 400

    # -------------------------------------------------------

    logging.info(f"Processing new user registration for: {email}")
    hashed_password = AuthService.hash_password(data['password'])

    new_user = User(
        email=email,
        password=hashed_password,
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        country=data.get('country')
    )

    saved_user = UserRepository.create(new_user)

    if saved_user:
        logging.info(f"Successfully registered user with ID: {saved_user.user_id}")
        return jsonify({
            "message": "Inscription réussie",
            "user": saved_user.to_dict()
        }), 201
    else:
        logging.error(f"Database insertion failed for user: {email}")
        return jsonify({"error": "Erreur lors de la création du compte"}), 500

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
    logging.info(f"Successful login for user ID: {user.user_id}. Generating token...")

    # Generate the JWT token using the Service layer
    token = AuthService.generate_token(user.user_id)

    return jsonify({
        "message": "Login successful",
        "token": token,
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


@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user_id):
    """
    Protected test route.
    Requires a valid JWT token in the Authorization header.
    """
    logging.info(f"Accessing protected profile for user ID: {current_user_id}")

    # Normally, you would use UserRepository here to fetch user details.
    # For this test, we just return a success message and the decoded ID.
    return jsonify({
        "message": "Access granted! Your token is valid.",
        "user_id": current_user_id
    }), 200


# ==========================================
# CATEGORIES & LINKS ENDPOINTS
# ==========================================

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """
    Endpoint to fetch all categories.
    Public route (no token required) so the frontend can build dropdown menus easily.
    """
    logging.info("Fetching all categories from database.")
    categories = CategoryRepository.get_all()
    categories_data = [cat.to_dict() for cat in categories]

    return jsonify(categories_data), 200


@app.route('/api/links', methods=['POST'])
@token_required
def create_link(current_user_id):
    """
    Endpoint to save a new link.
    Extracts web content, analyzes it with AI for Category and Tags,
    fetches dynamic metadata (title, author), and saves everything to the database.
    """
    data = request.get_json()

    if not data or not data.get('url'):
        logging.warning(f"Link creation failed for user {current_user_id}: Missing URL")
        return jsonify({"error": "Missing url"}), 400

    url = data['url']
    logging.info(f"User ID {current_user_id} requested analysis and save for: {url}")

    try:
        # --- 1. EXTRACTION ---
        logging.info("Starting web extraction...")
        extractor = ExtractorFactory.get_extractor(url)
        extracted_data = extractor.extract_data(url)

        if not extracted_data or not extracted_data.get("text"):
            logging.warning("Extraction failed or content is empty.")
            return jsonify({"error": "Cannot extract content from this link."}), 400

        extracted_text = extracted_data["text"]
        dynamic_title = extracted_data["title"]
        dynamic_thumbnail = extracted_data["thumbnail_url"]
        domain = url.split('/')[2].replace('www.', '') if '//' in url else 'Web'

        # --- 2. AI ANALYSIS ---
        logging.info("Sending extracted text to AI for categorization and tagging...")
        ai_result = analyzer.analyze(extracted_text)
        category_title = ai_result["category"]
        tags = ai_result["tags"]

        logging.info(f"AI detected category: {category_title} with tags: {tags}")

        # --- 3. DATABASE MAPPING ---
        category = CategoryRepository.get_by_title(category_title)

        if not category:
            logging.warning(f"AI detected '{category_title}' but it doesn't exist in DB.")
            return jsonify({"error": f"Detected category '{category_title}' is not configured."}), 400

        # --- 4. SAVING THE LINK & TAGS ---
        new_link = Link(
            url=url,
            title=data.get('title', dynamic_title),
            thumbnail_url=data.get('thumbnail_url', dynamic_thumbnail),
            platform=data.get('platform', domain),
            analysis_status='COMPLETED',
            category_id=category.category_id,
            user_id=current_user_id
        )

        success = LinkRepository.create_with_tags(new_link, tags)

        if success:
            logging.info(f"Successfully saved AI-categorized link with tags")
            return jsonify({
                "message": "Link successfully analyzed and saved!",
                "detected_category": category.title,
                "tags": tags,
                "title": new_link.title
            }), 201
        else:
            logging.error(f"Database insertion failed for link: {url}")
            return jsonify({"error": "Error saving the link to the database."}), 500

    except Exception as e:
        logging.error(f"Critical error during link creation flow: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500


@app.route('/api/links', methods=['GET'])
@token_required
def get_links(current_user_id):
    """
    Endpoint to fetch all links for the logged-in user.
    """
    logging.info(f"Fetching links for user ID: {current_user_id}")

    all_links = LinkRepository.get_all()

    user_links = [link.to_dict() for link in all_links if link.user_id == current_user_id]

    return jsonify(user_links), 200

@app.route('/api/links/<int:link_id>', methods=['DELETE'])
@token_required
def delete_link(current_user_id, link_id):
    """
    Endpoint to delete a specific link.
    """
    logging.info(f"User ID {current_user_id} attempting to delete link {link_id}")

    # 1. Use the Repository to find the link
    link = LinkRepository.get_by_id(link_id)

    if not link:
        logging.warning(f"Delete failed: Link {link_id} not found.")
        return jsonify({"error": "Lien introuvable."}), 404

    # 2. SECURITY : Check if the link is owned by the user
    if link.user_id != current_user_id:
        logging.warning(f"Security Alert: User {current_user_id} tried to delete link {link_id} belonging to user {link.user_id}")
        return jsonify({"error": "Action non autorisée."}), 403

    # 3. Use the Repository to delete the link
    success = LinkRepository.delete(link_id)

    if success:
        logging.info(f"Link {link_id} successfully deleted.")
        return jsonify({"message": "Lien supprimé avec succès."}), 200
    else:
        logging.error(f"Failed to delete link {link_id} from database.")
        return jsonify({"error": "Une erreur est survenue lors de la suppression."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
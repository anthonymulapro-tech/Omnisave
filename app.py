from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import html

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
from repositories.lexicon_repository import LexiconRepository

# --- Import hash ---
from werkzeug.security import check_password_hash, generate_password_hash

# --- Import auto-run script ---
import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from scripts.lexicon_merger import merge_community_lexicon

# --- Import utils ---
from utils import extract_platform

app = Flask(__name__)
CORS(app)

# ==========================================
# AI INITIALIZATION
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

lexicon_path = os.path.join(BASE_DIR, 'data', 'lexicon.json')
blacklist_path = os.path.join(BASE_DIR, 'data', 'blacklist.json')
community_path = os.path.join(BASE_DIR, 'data', 'community_lexicon.json')

analyzer = LinkAnalyzer(lexicon_path, blacklist_path, community_path)

# ==========================================
# BACKGROUND SCHEDULER (Community Lexicon Auto-Merge)
# ==========================================
# Protection for Flask debug mode to prevent duplicate scheduler instances
if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
    scheduler = BackgroundScheduler()
    # Runs every 10 minutes to process database suggestions into community_lexicon.json
    scheduler.add_job(func=merge_community_lexicon, trigger="interval", minutes=1)
    scheduler.start()

    # Ensure proper shutdown when Flask stops
    atexit.register(lambda: scheduler.shutdown())
    logging.info("🚀 Community Lexicon background scheduler started (every minute).")
# ==========================================
# API ENDPOINTS (ROUTES)
# ==========================================

# Configuration professionnelle des logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [%(levelname)s] - %(message)s')


@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """
    Endpoint to register a new user.
    Requires email, password, and password confirmation.
    """
    data = request.get_json()

    # 1. Validate presence of required fields, including confirmation
    if not data or not data.get('email') or not data.get('password') or not data.get('confirm_password'):
        logging.warning("Registration failed: Missing email, password, or confirm_password")
        return jsonify({"error": "Email, password, and confirmation are required."}), 400

    email = data['email']
    password_attempt = data['password']
    confirm_password = data['confirm_password']

    # --- 2. Check if both passwords match ---
    if password_attempt != confirm_password:
        logging.warning(f"Registration failed: Passwords do not match for {email}")
        return jsonify({"error": "The two passwords do not match."}), 400

    # --- 3. Prevent duplicate accounts ---
    existing_user = UserRepository.get_by_email(email)
    if existing_user:
        logging.warning(f"Registration failed: Email {email} already in use")
        return jsonify({"error": "This email is already in use."}), 409

    # --- 4. Backend Password Strength Validation ---
    if not AuthService.is_password_strong(password_attempt):
        logging.warning(f"Registration failed: Weak password provided for {email}")
        return jsonify({
            "error": "Password is too weak. It must contain at least 8 characters, an uppercase letter, a number, and a special character."
        }), 400

    # -------------------------------------------------------

    logging.info(f"Processing new user registration for: {email}")
    hashed_password = AuthService.hash_password(password_attempt)

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
            "message": "Registration successful!",
            "user": saved_user.to_dict()
        }), 201
    else:
        logging.error(f"Database insertion failed for user: {email}")
        return jsonify({"error": "An error occurred while creating the account."}), 500

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


# ==========================================
# CRUD PROFILE
# ==========================================


@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user_id):
    """
    Protected route to get the current user's profile data.
    """
    logging.info(f"User ID {current_user_id} requested their profile.")

    user = UserRepository.get_by_id(current_user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    # We use the to_dict() method which strips the password automatically
    return jsonify(user.to_dict()), 200


@app.route('/api/profile', methods=['PUT'])
@token_required
def update_profile(current_user_id):
    """
    Protected route to update the current user's profile data, including email.
    """
    logging.info(f"User ID {current_user_id} is updating their profile.")

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    user = UserRepository.get_by_id(current_user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    # --- EMAIL SECURITY CHECK ---
    new_email = data.get('email')
    if new_email and new_email != user.email:
        # Check if the new email is already used by someone else
        existing_user = UserRepository.get_by_email(new_email)
        if existing_user:
            return jsonify({"error": "This email address is already in use by another account."}), 409
        user.email = new_email

    # Update other fields
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.pseudo = data.get('pseudo', user.pseudo)
    user.profile_picture = data.get('profile_picture', user.profile_picture)

    if 'fast_save' in data:
        user.fast_save = bool(data['fast_save'])

    user.country = data.get('country', user.country)

    success, error_msg = UserRepository.update(user)

    if success:
        return jsonify({
            "message": "Profile successfully updated!",
            "user": user.to_dict()
        }), 200
    else:
        return jsonify({"error": f"Database error: {error_msg}"}), 500


@app.route('/api/profile/password', methods=['PUT'])
@token_required
def update_password(current_user_id):
    """
    Protected route to update the user's password.
    Requires the old password for verification.
    """
    logging.info(f"User ID {current_user_id} requested a password change.")

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({"error": "Both old and new passwords are required."}), 400

    user = UserRepository.get_by_id(current_user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    # Verify that the old password matches the one in the database
    # NOTE: If you start hashing passwords later, use check_password_hash() here instead of ==
    if not check_password_hash(user.password, old_password):
        return jsonify({"error": "Incorrect current password."}), 401

    hashed_new_password = generate_password_hash(new_password)

    # Update with the new password
    success = UserRepository.update_password(current_user_id, hashed_new_password)

    if success:
        logging.info(f"User ID {current_user_id} successfully changed their password.")
        return jsonify({"message": "Password successfully updated!"}), 200
    else:
        return jsonify({"error": "An error occurred while updating the password."}), 500

@app.route('/api/profile', methods=['DELETE'])
@token_required
def delete_profile(current_user_id):
    """
    Protected route to delete the current user's account and all associated data.
    """
    logging.warning(f"User ID {current_user_id} requested account DELETION.")

    success = UserRepository.delete(current_user_id)

    if success:
        logging.info(f"User ID {current_user_id} successfully deleted their account.")
        return jsonify({"message": "Account successfully deleted."}), 200
    else:
        return jsonify({"error": "An error occurred while deleting the account."}), 500

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


@app.route('/api/links/preview', methods=['POST'])
@token_required
def preview_link(current_user_id):
    """
    Step 1: Preview Endpoint.
    Extracts web content and analyzes it with AI.
    Includes a fallback mechanism for Single Page Applications (SPA)
    or platforms with strict anti-bot protections (e.g., X, TikTok).
    """
    data = request.get_json()

    if not data or not data.get('url'):
        return jsonify({"error": "Missing url"}), 400

    url = data['url']
    logging.info(f"User ID {current_user_id} requested PREVIEW for: {url}")

    try:
        # 1. Dynamically extract the domain using the utility function
        domain = extract_platform(url)

        # 2. START EXTRACTION
        logging.info("Starting web extraction for preview...")
        extractor = ExtractorFactory.get_extractor(url)
        extracted_data = extractor.extract_data(url)

        # --- FALLBACK MECHANISM ---
        # If the extractor is blocked (e.g., by Cloudflare) and returns no text
        if not extracted_data or not extracted_data.get("text"):
            logging.warning(f"Anti-bot blocking or no text detected for {url}. Using fallback.")

            return jsonify({
                "url": url,
                "title": f"Post on {domain.capitalize()}",
                "thumbnail_url": "",  # Empty string prevents Chrome extension image download errors
                "platform": domain,
                "categories": ["Divers"],
                "tags": [domain.split('.')[0]]
            }), 200
        # --------------------------

        extracted_text = extracted_data["text"]
        dynamic_title = extracted_data["title"]
        dynamic_thumbnail = extracted_data["thumbnail_url"]

        # 3. AI ANALYSIS (Only runs if text was successfully extracted)
        logging.info("Sending extracted text to AI for categorization and tagging...")
        ai_result = analyzer.analyze(extracted_text)

        # 4. RETURN SUCCESSFUL PREVIEW DATA
        return jsonify({
            "url": url,
            "title": dynamic_title,
            "thumbnail_url": dynamic_thumbnail,
            "platform": domain,
            "categories": [ai_result["category"]],
            "tags": ai_result["tags"]
        }), 200

    except Exception as e:
        # GLOBAL FALLBACK
        # Catches severe crashes (e.g., HTTP 500 from scraping libraries)
        logging.error(f"Error during link preview flow: {e}. Using global fallback.")
        domain = extract_platform(url)

        return jsonify({
            "url": url,
            "title": f"Link from {domain.capitalize()}",
            "thumbnail_url": "",
            "platform": domain,
            "categories": ["Divers"],
            "tags": []
        }), 200


@app.route('/api/links', methods=['POST'])
@token_required
def save_link(current_user_id):
    """
    Step 2: Save Endpoint.
    Receives the finalized data from the frontend Sidebar.
    Saves the link, tags, and multiple categories (Max 5) to the database.
    """
    data = request.get_json()

    required_fields = ['url', 'title', 'categories', 'tags']
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields for saving"}), 400

    logging.info(f"User ID {current_user_id} requested SAVE for: {data['url']}")

    try:
        # --- 1. ANTI-DOUBLONS (SECURITY) ---
        if LinkRepository.exists_for_user(data['url'], current_user_id):
            logging.warning(f"Duplicate attempt: User {current_user_id} tried to save {data['url']} again.")
            return jsonify({"error": "Ce lien est déjà sauvegardé dans votre collection."}), 409

        # --- 2. VALIDATE CATEGORIES (MAX 5) ---
        categories_input = data['categories']

        if not isinstance(categories_input, list):
            return jsonify({"error": "Categories must be an array."}), 400

        if len(categories_input) > 5:
            return jsonify({"error": "You cannot assign more than 5 categories."}), 400

        cleaned_categories = list(set([cat.strip() for cat in categories_input if cat.strip()]))
        if not cleaned_categories:
            return jsonify({"error": "At least one valid category is required."}), 400

        # --- 3. ANTI-XSS CLEANUP (SECURITY) ---
        safe_title = html.escape(data['title'].strip())
        safe_categories = [html.escape(cat) for cat in cleaned_categories]
        safe_tags = [html.escape(tag.strip()) for tag in data['tags'] if tag.strip()]

        # --- 4. PREPARE THE LINK OBJECT ---
        new_link = Link(
            url=data['url'],
            title=safe_title,
            thumbnail_url=data.get('thumbnail_url', ''),
            platform=data.get('platform', 'Web'),
            analysis_status='COMPLETED',
            user_id=current_user_id
        )

        # --- 5. SAVE TO DB USING REPOSITORY ---
        success = LinkRepository.create_with_details(new_link, safe_tags, safe_categories)

        if success:
            logging.info("Successfully saved user-validated link with tags and categories")
            return jsonify({"message": "Lien sauvegardé avec succès !"}), 201
        else:
            return jsonify({"error": "Erreur lors de la sauvegarde du lien."}), 500

    except Exception as e:
        logging.error(f"Critical error during link save flow: {e}")
        return jsonify({"error": "Une erreur interne est survenue."}), 500


@app.route('/api/links/<int:link_id>', methods=['PUT'])
@token_required
def update_link(current_user_id, link_id):
    """
    Update Endpoint.
    Allows users to modify the title, tags, and categories (Max 5) of an existing link.
    """
    data = request.get_json()

    # Changed 'category' to 'categories'
    required_fields = ['title', 'categories', 'tags']
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields for updating"}), 400

    logging.info(f"User ID {current_user_id} requested UPDATE for link ID: {link_id}")

    try:
        # --- 1. VALIDATE CATEGORIES (MAX 5) ---
        categories_input = data['categories']

        if not isinstance(categories_input, list):
            return jsonify({"error": "Categories must be an array."}), 400

        if len(categories_input) > 5:
            return jsonify({"error": "You cannot assign more than 5 categories."}), 400

        cleaned_categories = list(set([cat.strip() for cat in categories_input if cat.strip()]))

        if not cleaned_categories:
            return jsonify({"error": "At least one valid category is required."}), 400

        # --- 2. FETCH EXISTING LINK & SECURITY CHECK ---
        existing_link = LinkRepository.get_by_id(link_id)

        if not existing_link:
            return jsonify({"error": "Link not found."}), 404

        if existing_link.user_id != current_user_id:
            logging.warning(
                f"User {current_user_id} attempted to edit link {link_id} belonging to User {existing_link.user_id}")
            return jsonify({"error": "Unauthorized to edit this link."}), 403

        # --- 3. ANTI-XSS CLEANUP & UPDATE THE LINK OBJECT ---
        # Nettoyage anti-XSS (on échappe les chevrons HTML)
        safe_title = html.escape(data['title'].strip())
        safe_categories = [html.escape(cat) for cat in cleaned_categories]
        safe_tags = [html.escape(tag.strip()) for tag in data['tags'] if tag.strip()]

        existing_link.title = safe_title

        if 'thumbnail_url' in data:
            existing_link.thumbnail_url = data['thumbnail_url']

        # --- 4. SAVE CHANGES TO DB USING REPOSITORY ---
        # update_with_details receives the safe arrays
        success = LinkRepository.update_with_details(existing_link, safe_tags, safe_categories)

        if success:
            logging.info(f"Successfully updated link {link_id} with new details")
            return jsonify({"message": "Link successfully updated!"}), 200
        else:
            return jsonify({"error": "Error updating the link in the database."}), 500

    except Exception as e:
        logging.error(f"Critical error during link update flow: {e}")
        return jsonify({"error": "An internal server error occurred while updating."}), 500
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

@app.route('/api/links/<int:link_id>/favorite', methods=['PUT'])
@token_required
def toggle_favorite_link(current_user_id, link_id):
    """
    Update Endpoint for Favorites.
    Allows users to toggle the is_favorite status without sending the whole link data.
    """
    data = request.get_json()

    if data is None or 'is_favorite' not in data:
        return jsonify({"error": "Missing 'is_favorite' boolean field"}), 400

    new_favorite_status = bool(data['is_favorite'])
    logging.info(f"User ID {current_user_id} requested FAVORITE toggle ({new_favorite_status}) for link ID: {link_id}")

    try:
        # --- 1. FETCH EXISTING LINK & SECURITY CHECK ---
        existing_link = LinkRepository.get_by_id(link_id)

        if not existing_link:
            return jsonify({"error": "Link not found."}), 404

        if existing_link.user_id != current_user_id:
            logging.warning(f"Security Alert: User {current_user_id} attempted to favorite link {link_id} belonging to User {existing_link.user_id}")
            return jsonify({"error": "Unauthorized to edit this link."}), 403

        # --- 2. UPDATE STATUS ---
        success = LinkRepository.toggle_favorite(link_id, new_favorite_status)

        if success:
            return jsonify({
                "message": "Favorite status successfully updated!",
                "is_favorite": new_favorite_status
            }), 200
        else:
            return jsonify({"error": "Error updating the favorite status in the database."}), 500

    except Exception as e:
        logging.error(f"Critical error during favorite toggle: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500


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

# ==========================================
#               LEXICON
# ==========================================

@app.route('/api/lexicon/suggest', methods=['POST'])
@token_required
def suggest_lexicon_word(current_user_id):
    """
    Endpoint to receive community suggestions for new words and categories.
    Handles both single word/tags and single/multiple categories.
    """
    try:
        data = request.get_json()

        categories = data.get('categories', [])
        single_category = data.get('category')
        if single_category and single_category not in categories:
            categories.append(single_category)

        words = data.get('tags', [])
        single_word = data.get('word')
        if single_word and single_word not in words:
            words.append(single_word)

        if not words or not categories:
            return jsonify({"error": "At least one category and one word/tag are required."}), 400

        success_count = 0

        for category in categories:
            clean_category = category.strip().lower()
            if not clean_category:
                continue

            for word in words:
                clean_word = word.strip().lower()
                if len(clean_word) < 2:
                    continue

                success, error_msg = LexiconRepository.add_suggestion(clean_word, clean_category)
                if success:
                    success_count += 1

        if success_count > 0:
            return jsonify({"message": f"Successfully recorded {success_count} suggestions!"}), 201
        else:
            return jsonify({"error": "Failed to record suggestions."}), 500

    except Exception as e:
        print(f"❌ Server error during lexicon suggestion: {e}")
        return jsonify({"error": "An unexpected error occurred on the server."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
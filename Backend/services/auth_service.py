from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from flask import request, jsonify
import os
from dotenv import load_dotenv

load_dotenv()

class AuthService:
    """
    Service class handling all authentication and security logic.
    """

    SECRET_KEY = os.getenv("SECRET_KEY")

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Takes a plain text password and returns a hashed string.
        """
        return generate_password_hash(password)

    @staticmethod
    def verify_password(hashed_password: str, plain_password: str) -> bool:
        """
        Compares a plain text password with a hashed password from the DB.
        Returns True if they match, False otherwise.
        """
        return check_password_hash(hashed_password, plain_password)

    @staticmethod
    def generate_token(user_id: int) -> str:
        """
        Generates a JWT token for a given user ID, valid for 24 hours.
        """
        payload = {
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),  # Expiration time
            'iat': datetime.datetime.utcnow()  # Issued at
        }

        # Encode the payload into a JWT string using the secret key
        token = jwt.encode(payload, AuthService.SECRET_KEY, algorithm='HS256')
        return token


def token_required(f):
    """
    Decorator to protect routes.
    It checks for a valid JWT token in the Authorization header.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # 1. Check if the "Authorization" header is present
        if 'Authorization' in request.headers:
            # The standard format is "Bearer <token>"
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        # 2. If no token is found
        if not token:
            return jsonify({"error": "Token is missing. Please log in."}), 401

        # 3. Try to decode the token
        try:
            # Use the secret key from our AuthService class
            data = jwt.decode(token, AuthService.SECRET_KEY, algorithms=["HS256"])
            # Extract the user ID contained in the token
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token. Please log in again."}), 401

        # 4. If everything is fine, pass the request to the actual Flask route
        # and pass the user ID so it knows who is performing the action
        return f(current_user_id, *args, **kwargs)

    return decorated
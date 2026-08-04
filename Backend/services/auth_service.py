from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime


class AuthService:
    """
    Service class handling all authentication and security logic.
    """

    SECRET_KEY = "omnisave_super_secret_key_2026"

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
from werkzeug.security import generate_password_hash, check_password_hash


class AuthService:
    """
    Service class handling all authentication and security logic.
    """

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
from config.db_connection import DatabaseConnection
from models.user import User
from mysql.connector import Error

class UserRepository:
    """
    Handles all database operations (CRUD) for the User entity.
    Acts as a bridge between the English Python object and the French SQL database.
    """

    @staticmethod
    def create(user: User):
        """
        Inserts a new user into the database.
        Returns the User object updated with the newly generated ID.
        """
        connection = DatabaseConnection.get_connection()
        if not connection:
            print("❌ Database connection failed.")
            return None

        try:
            cursor = connection.cursor()

            # The SQL query uses French column names to match the database schema
            # Added pseudo, photo_profil, and fast_save
            sql = """
                  INSERT INTO utilisateur
                      (email, password, prenom, nom, pseudo, photo_profil, fast_save, pays, role_id)
                  VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) \
                  """

            # Mapping the English object attributes to the query values
            values = (
                user.email,
                user.password,
                user.first_name,
                user.last_name,
                user.pseudo,
                user.profile_picture,
                user.fast_save,
                user.country,
                user.role_id
            )

            cursor.execute(sql, values)
            connection.commit()

            user.user_id = cursor.lastrowid
            print(f"✅ User successfully created with ID: {user.user_id}")

            return user

        except Error as e:
            print(f"❌ Error while creating user: {e}")
            return None

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def get_by_email(email: str):
        """
        Retrieves a user from the database using their email.
        Returns a User object, or None if not found.
        """
        connection = DatabaseConnection.get_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            sql = "SELECT * FROM utilisateur WHERE email = %s"
            cursor.execute(sql, (email,))

            row = cursor.fetchone()

            if row:
                # Translating the French SQL row back into an English Python User object
                return User(
                    user_id=row['utilisateur_id'],
                    email=row['email'],
                    password=row['password'],
                    first_name=row['prenom'],
                    last_name=row['nom'],
                    pseudo=row['pseudo'],                     # New field
                    profile_picture=row['photo_profil'],      # New field
                    fast_save=bool(row['fast_save']),         # New field
                    country=row['pays'],
                    is_active=bool(row['est_actif']),
                    created_at=row['date_creation'],
                    role_id=row['role_id']
                )
            return None

        except Error as e:
            print(f"❌ Error while fetching user: {e}")
            return None

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def get_by_id(user_id: int):
        """
        Retrieves a user from the database using their ID.
        Returns a User object, or None if not found.
        """
        connection = DatabaseConnection.get_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            sql = "SELECT * FROM utilisateur WHERE utilisateur_id = %s"
            cursor.execute(sql, (user_id,))

            row = cursor.fetchone()

            if row:
                return User(
                    user_id=row['utilisateur_id'],
                    email=row['email'],
                    password=row['password'],
                    first_name=row['prenom'],
                    last_name=row['nom'],
                    pseudo=row['pseudo'],
                    profile_picture=row['photo_profil'],
                    fast_save=bool(row['fast_save']),
                    country=row['pays'],
                    is_active=bool(row['est_actif']),
                    created_at=row['date_creation'],
                    role_id=row['role_id']
                )
            return None

        except Error as e:
            print(f"❌ Error while fetching user by ID: {e}")
            return None

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def update(user: User) -> bool:
        """
        Updates an existing user's profile information in the database.
        Does not update email or password (which should have their own dedicated methods).
        """
        connection = DatabaseConnection.get_connection()
        if not connection:
            return False

        try:
            cursor = connection.cursor()

            sql = """
                  UPDATE utilisateur 
                  SET prenom = %s, 
                      nom = %s, 
                      pseudo = %s, 
                      photo_profil = %s, 
                      fast_save = %s, 
                      pays = %s
                  WHERE utilisateur_id = %s
                  """

            values = (
                user.first_name,
                user.last_name,
                user.pseudo,
                user.profile_picture,
                user.fast_save,
                user.country,
                user.user_id
            )

            cursor.execute(sql, values)
            connection.commit()
            return True

        except Error as e:
            print(f"❌ Error while updating user profile: {e}")
            connection.rollback()
            return False

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def delete(user_id: int) -> bool:
        """
        Deletes a user and all their associated data (links and tags) from the database.
        Ensures proper cleanup to respect foreign key constraints.
        """
        connection = DatabaseConnection.get_connection()
        if not connection:
            return False

        try:
            cursor = connection.cursor()

            # 1. Find all links belonging to the user
            cursor.execute("SELECT url_id FROM lien WHERE utilisateur_id = %s", (user_id,))
            links = cursor.fetchall()
            link_ids = [row[0] for row in links]

            # 2. Delete tag associations for these links
            if link_ids:
                format_strings = ','.join(['%s'] * len(link_ids))
                cursor.execute(f"DELETE FROM lien_tag WHERE url_id IN ({format_strings})", tuple(link_ids))

                # 3. Delete the user's links
                cursor.execute("DELETE FROM lien WHERE utilisateur_id = %s", (user_id,))

            # 4. Finally, delete the user account
            cursor.execute("DELETE FROM utilisateur WHERE utilisateur_id = %s", (user_id,))

            connection.commit()
            return True

        except Error as e:
            print(f"❌ Error deleting user account: {e}")
            connection.rollback()
            return False

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
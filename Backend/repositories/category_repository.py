from config.db_connection import DatabaseConnection
from models.category import Category


class CategoryRepository:
    """
    Handles all database interactions for the 'categorie' table.
    This is where the mapping between the database schema (French)
    and the Python Domain Model (English) happens.
    """

    @staticmethod
    def get_all() -> list[Category]:
        """
        Retrieves all categories from the database.
        Returns a list of Category objects.
        """
        connection = DatabaseConnection.get_connection()
        categories = []

        if connection:
            try:
                # dictionary=True fetches results as Python dictionaries instead of tuples
                cursor = connection.cursor(dictionary=True)

                # Execute the SQL query
                cursor.execute("SELECT categorie_id, titre_categorie, description_categorie FROM categorie;")
                records = cursor.fetchall()

                # Transform SQL rows into Python 'Category' objects
                for row in records:
                    category = Category(
                        category_id=row['categorie_id'],
                        title=row['titre_categorie'],
                        description=row['description_categorie']
                    )
                    categories.append(category)

            except Exception as e:
                print(f"❌ Error fetching categories: {e}")

            finally:
                # Always close the cursor and connection to prevent resource leaks
                if connection.is_connected():
                    cursor.close()
                    connection.close()

        return categories


    @staticmethod
    def get_by_title(title: str):
        connection = DatabaseConnection.get_connection()
        category = None
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                sql = "SELECT categorie_id, titre_categorie, description_categorie FROM categorie WHERE titre_categorie = %s;"
                cursor.execute(sql, (title,))
                row = cursor.fetchone()
                if row:
                    category = Category(
                        category_id=row['categorie_id'],
                        title=row['titre_categorie'],
                        description=row['description_categorie']
                    )
            except Exception as e:
                print(f"❌ Error fetching category: {e}")
            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()
        return category


    @staticmethod
    def get_or_create_by_title(title: str) -> int:
        """
        Looks for a category by title. If it doesn't exist, creates it
        and returns the new category_id. This prevents foreign key errors
        when saving a link with a brand new category.
        """
        # Clean the title: remove extra spaces and capitalize the first letter (e.g., "jardinage" -> "Jardinage")
        clean_title = title.strip().capitalize()

        connection = DatabaseConnection.get_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)

            # 1. Check if the category already exists (using LOWER to be case-insensitive)
            sql_check = "SELECT categorie_id FROM categorie WHERE LOWER(titre_categorie) = LOWER(%s);"
            cursor.execute(sql_check, (clean_title,))
            row = cursor.fetchone()

            if row:
                # Category exists, return its ID
                return row['categorie_id']

            # 2. If it doesn't exist, we create it
            description = "Auto-created from user input"
            sql_insert = """
                         INSERT INTO categorie (titre_categorie, description_categorie)
                         VALUES (%s, %s); \
                         """
            cursor.execute(sql_insert, (clean_title, description))
            connection.commit()

            # Return the newly generated ID
            return cursor.lastrowid

        except Exception as e:
            print(f"❌ Error in get_or_create_by_title: {e}")
            connection.rollback()
            return None

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()


# --- QUICK TEST ---
if __name__ == "__main__":
    print("--- Testing CategoryRepository ---")

    # Test 1 : On simule l'ajout d'une toute nouvelle catégorie (ex: "Astronomie")
    print("\n1. Testing creation of a new category 'astronomie'...")
    new_id = CategoryRepository.get_or_create_by_title("astronomie")
    if new_id:
        print(f"✅ Success! Category created (or found) with ID: {new_id}")
    else:
        print("❌ Error: Failed to get or create category.")

    # Test 2 : On simule un autre utilisateur qui tape la même catégorie,
    # mais en majuscule, pour voir si ça évite bien les doublons.
    print("\n2. Testing fetch of the same category with caps 'ASTRONOMIE'...")
    existing_id = CategoryRepository.get_or_create_by_title("ASTRONOMIE")

    if existing_id == new_id:
        print(f"✅ Success! It correctly found the existing category instead of duplicating it. ID: {existing_id}")
    else:
        print(f"❌ Error: It might have duplicated the category. Got ID: {existing_id}")
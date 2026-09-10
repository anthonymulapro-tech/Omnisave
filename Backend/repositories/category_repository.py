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
from config.db_connection import DatabaseConnection
from models.link import Link


class LinkRepository:
    """
    Handles all database interactions for the 'lien' table.
    Responsible for saving new links and retrieving existing ones.
    """

    @staticmethod
    def create(link: Link) -> bool:
        """
        Inserts a new Link object into the MySQL database.
        Returns True if the insertion was successful, False otherwise.
        """
        connection = DatabaseConnection.get_connection()
        success = False

        if connection:
            try:
                cursor = connection.cursor()

                # We intentionally omit url_id (AUTO_INCREMENT) and date_sauvegarde (CURRENT_TIMESTAMP)
                # MySQL will handle them automatically.
                sql = """
                      INSERT INTO lien
                      (url, titre_url, url_miniature, plateforme, statut_analyse, categorie_id, utilisateur_id)
                      VALUES (%s, %s, %s, %s, %s, %s, %s) \
                      """

                # Extracting values from the Python object
                values = (
                    link.url,
                    link.title,
                    link.thumbnail_url,
                    link.platform,
                    link.analysis_status,
                    link.category_id,
                    link.user_id
                )

                cursor.execute(sql, values)
                connection.commit()  # Save the data

                # Get the auto-generated ID from MySQL and assign it to our Python object
                link.link_id = cursor.lastrowid

                success = True

            except Exception as e:
                print(f"❌ Error inserting link: {e}")
                connection.rollback()  # Cancel transaction in case of error

            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()

        return success

    @staticmethod
    def get_all() -> list[Link]:
        """
        Retrieves all links from the database.
        Returns a list of Link objects.
        """
        connection = DatabaseConnection.get_connection()
        links = []

        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                cursor.execute("SELECT * FROM lien;")
                records = cursor.fetchall()

                for row in records:
                    link = Link(
                        link_id=row['url_id'],
                        url=row['url'],
                        title=row['titre_url'],
                        thumbnail_url=row['url_miniature'],
                        platform=row['plateforme'],
                        saved_at=row['date_sauvegarde'],
                        analysis_status=row['statut_analyse'],
                        category_id=row['categorie_id'],
                        user_id=row['utilisateur_id']
                    )
                    links.append(link)

            except Exception as e:
                print(f"❌ Error fetching links: {e}")

            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()

        return links
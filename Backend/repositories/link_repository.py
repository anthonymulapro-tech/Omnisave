from config.db_connection import DatabaseConnection
from models.link import Link


class LinkRepository:
    """
    Handles all database interactions for the 'lien' table.
    Responsible for saving new links and retrieving existing ones.
    """

    @classmethod
    def create_with_tags(cls, link_obj, tags_list):
        """
        Inserts a new link, manages tags creation, and links them in the join table.
        Uses a SQL Transaction to ensure data integrity.
        """
        connection = DatabaseConnection.get_connection()
        success = False

        if connection:
            try:
                cursor = connection.cursor()

                # 1. Insert the main link record
                query_link = """
                             INSERT INTO lien (url, titre_url, url_miniature, plateforme, statut_analyse, categorie_id, \
                                               utilisateur_id)
                             VALUES (%s, %s, %s, %s, %s, %s, %s) \
                             """
                cursor.execute(query_link, (
                    link_obj.url, link_obj.title, link_obj.thumbnail_url, link_obj.platform,
                    link_obj.analysis_status, link_obj.category_id, link_obj.user_id
                ))

                # Retrieve the ID of the newly created link (url_id)
                url_id = cursor.lastrowid

                # 2. Process each tag
                for tag_name in tags_list:
                    # Check if the tag already exists in the 'tag' table
                    cursor.execute("SELECT tag_id FROM tag WHERE tag_libelle = %s", (tag_name,))
                    result = cursor.fetchone()

                    if result:
                        # Standard cursor returns a tuple, e.g., (5,)
                        tag_id = result[0]
                    else:
                        # Tag does not exist, so we create it
                        cursor.execute("INSERT INTO tag (tag_libelle) VALUES (%s)", (tag_name,))
                        tag_id = cursor.lastrowid

                        # 3. Link the tag to the URL (Join table)
                        # We use INSERT IGNORE so MySQL silently skips duplicate tag associations
                        # instead of crashing the entire transaction.
                        cursor.execute("INSERT IGNORE INTO lien_tag (tag_id, url_id) VALUES (%s, %s)", (tag_id, url_id))

                # If everything succeeded, commit the transaction!
                connection.commit()
                success = True

            except Exception as e:
                # In case of an error, rollback EVERYTHING to prevent corrupted data
                connection.rollback()
                print(f"❌ Database Transaction Error: {e}")
                success = False

            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()

        return success

    @staticmethod
    def get_all() -> list[Link]:
        """
        Retrieves all links from the database, including their category name and associated tags.
        Utilizes SQL JOINs and GROUP_CONCAT to prevent N+1 query performance issues.
        """
        connection = DatabaseConnection.get_connection()
        links = []

        if connection:
            try:
                cursor = connection.cursor(dictionary=True)

                # Optimized query aggregating tags into a single comma-separated string
                sql = """
                      SELECT l.*, \
                             c.titre_categorie, \
                             GROUP_CONCAT(t.tag_libelle SEPARATOR ',') as tags_list
                      FROM lien l
                               LEFT JOIN categorie c ON l.categorie_id = c.categorie_id
                               LEFT JOIN lien_tag lt ON l.url_id = lt.url_id
                               LEFT JOIN tag t ON lt.tag_id = t.tag_id
                      GROUP BY l.url_id; \
                      """
                cursor.execute(sql)
                records = cursor.fetchall()

                for row in records:
                    # Parse the comma-separated string back into a Python list
                    tags_string = row.get('tags_list')
                    tags_list = tags_string.split(',') if tags_string else []

                    link = Link(
                        link_id=row['url_id'],
                        url=row['url'],
                        title=row['titre_url'],
                        thumbnail_url=row['url_miniature'],
                        platform=row['plateforme'],
                        saved_at=row['date_sauvegarde'],
                        analysis_status=row['statut_analyse'],
                        category_id=row['categorie_id'],
                        user_id=row['utilisateur_id'],
                        category_name=row['titre_categorie'],  # Injected category name
                        tags=tags_list  # Injected tags array
                    )
                    links.append(link)

            except Exception as e:
                print(f"❌ Error fetching links: {e}")

            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()

        return links

    @staticmethod
    def get_by_id(link_id: int):
        """
        Get a specific link by his ID
        """
        connection = DatabaseConnection.get_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                sql = "SELECT * FROM lien WHERE url_id = %s"
                cursor.execute(sql, (link_id,))
                row = cursor.fetchone()

                if row:
                    return Link(
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
            except Exception as e:
                print(f"❌ Error fetching link by ID: {e}")
            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()
        return None

    @staticmethod
    def delete(link_id: int) -> bool:
        """
        Delete the link from the database, if it exists.
        """
        connection = DatabaseConnection.get_connection()
        if connection:
            try:
                cursor = connection.cursor()

                sql_tags = "DELETE FROM lien_tag WHERE url_id = %s"
                cursor.execute(sql_tags, (link_id,))

                sql_link = "DELETE FROM lien WHERE url_id = %s"
                cursor.execute(sql_link, (link_id,))

                connection.commit()
                return True

            except Exception as e:
                connection.rollback()
                print(f"❌ Error deleting link: {e}")
                return False

            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()
        return False
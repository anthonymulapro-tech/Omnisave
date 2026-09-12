from config.db_connection import DatabaseConnection
from models.link import Link


class LinkRepository:
    """
    Handles all database interactions for the 'lien' table.
    Responsible for saving new links and retrieving existing ones.
    """

    @staticmethod
    def create_with_tags(link, tags: list[str]) -> bool:
        """
        Inserts a new link into the database and associates it with tags.
        Intelligently handles tags to prevent duplication errors (upsert logic).
        """
        connection = DatabaseConnection.get_connection()
        if connection:
            try:
                # We use a standard cursor here (not dictionary=True)
                # to easily retrieve lastrowid and tuple results
                cursor = connection.cursor()

                # --- 1. INSERT THE LINK ---
                sql_link = """
                           INSERT INTO lien (url, titre_url, url_miniature, plateforme, statut_analyse, categorie_id, \
                                             utilisateur_id)
                           VALUES (%s, %s, %s, %s, %s, %s, %s) \
                           """
                link_values = (
                    link.url, link.title, link.thumbnail_url, link.platform,
                    link.analysis_status, link.category_id, link.user_id
                )
                cursor.execute(sql_link, link_values)

                # Get the newly generated url_id
                new_link_id = cursor.lastrowid

                # --- 2. HANDLE TAGS INTELLIGENTLY ---
                if tags:
                    linked_tag_ids = set()

                    for tag_name in tags:
                        # a) Check if the tag already exists in the 'tag' table
                        sql_check_tag = "SELECT tag_id FROM tag WHERE tag_libelle = %s"
                        cursor.execute(sql_check_tag, (tag_name,))
                        existing_tag = cursor.fetchone()

                        if existing_tag:
                            tag_id = existing_tag[0]
                        else:
                            # Tag doesn't exist: insert it and get the new ID
                            sql_insert_tag = "INSERT INTO tag (tag_libelle) VALUES (%s)"
                            cursor.execute(sql_insert_tag, (tag_name,))
                            tag_id = cursor.lastrowid

                        # b) Link the tag ONLY if it hasn't been linked yet for this video
                        if tag_id not in linked_tag_ids:
                            sql_link_tag = "INSERT INTO lien_tag (url_id, tag_id) VALUES (%s, %s)"
                            cursor.execute(sql_link_tag, (new_link_id, tag_id))
                            linked_tag_ids.add(tag_id)  # On l'ajoute à la mémoire pour ne pas le refaire !

                # --- 3. COMMIT EVERYTHING ---
                # If everything went well, save the link AND the tags permanently
                connection.commit()
                return True

            except Exception as e:
                # SECURITY: If any query fails, undo EVERYTHING (rollback)
                # This prevents having a link saved without its tags
                connection.rollback()
                print(f"❌ Error saving link with tags: {e}")
                return False

            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()

        return False

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
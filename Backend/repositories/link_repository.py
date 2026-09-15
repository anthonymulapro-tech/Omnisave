from config.db_connection import DatabaseConnection
from models.link import Link


class LinkRepository:
    """
    Handles all database interactions for the 'lien' table.
    Responsible for saving new links and retrieving existing ones,
    now supporting multiple categories and tags.
    """

    @staticmethod
    def create_with_details(link, tags: list[str], categories: list[str]) -> bool:
        """
        Inserts a new link into the database and associates it with tags and multiple categories.
        Intelligently handles tags and categories to prevent duplication errors.
        """
        connection = DatabaseConnection.get_connection()
        if connection:
            try:
                cursor = connection.cursor()

                # --- 1. INSERT THE LINK (Removed categorie_id) ---
                sql_link = """
                           INSERT INTO lien (url, titre_url, url_miniature, plateforme, statut_analyse, utilisateur_id)
                           VALUES (%s, %s, %s, %s, %s, %s)
                           """
                link_values = (
                    link.url, link.title, link.thumbnail_url, link.platform,
                    link.analysis_status, link.user_id
                )
                cursor.execute(sql_link, link_values)

                new_link_id = cursor.lastrowid

                # --- 2. HANDLE CATEGORIES (Max 5 enforced by backend route, but handled safely here) ---
                if categories:
                    linked_cat_ids = set()
                    for cat_name in categories:
                        # a) Check if category exists
                        cursor.execute("SELECT categorie_id FROM categorie WHERE titre_categorie = %s", (cat_name,))
                        existing_cat = cursor.fetchone()

                        if existing_cat:
                            cat_id = existing_cat[0]
                        else:
                            # b) Insert new category
                            cursor.execute("INSERT INTO categorie (titre_categorie) VALUES (%s)", (cat_name,))
                            cat_id = cursor.lastrowid

                        # c) Link it in the junction table
                        if cat_id not in linked_cat_ids:
                            cursor.execute("INSERT INTO lien_categorie (url_id, categorie_id) VALUES (%s, %s)",
                                           (new_link_id, cat_id))
                            linked_cat_ids.add(cat_id)

                # --- 3. HANDLE TAGS INTELLIGENTLY ---
                if tags:
                    linked_tag_ids = set()
                    for tag_name in tags:
                        cursor.execute("SELECT tag_id FROM tag WHERE tag_libelle = %s", (tag_name,))
                        existing_tag = cursor.fetchone()

                        if existing_tag:
                            tag_id = existing_tag[0]
                        else:
                            cursor.execute("INSERT INTO tag (tag_libelle) VALUES (%s)", (tag_name,))
                            tag_id = cursor.lastrowid

                        if tag_id not in linked_tag_ids:
                            cursor.execute("INSERT INTO lien_tag (url_id, tag_id) VALUES (%s, %s)",
                                           (new_link_id, tag_id))
                            linked_tag_ids.add(tag_id)

                # --- 4. COMMIT EVERYTHING ---
                connection.commit()
                return True

            except Exception as e:
                connection.rollback()
                print(f"❌ Error saving link with details: {e}")
                return False

            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()

        return False

    @staticmethod
    def get_all() -> list[Link]:
        """
        Retrieves all links from the database, including their multiple categories and associated tags.
        Utilizes SQL JOINs and GROUP_CONCAT with DISTINCT to prevent Cartesian product duplication.
        """
        connection = DatabaseConnection.get_connection()
        links = []

        if connection:
            try:
                cursor = connection.cursor(dictionary=True)

                # Optimized query using DISTINCT to avoid duplicate records when joining multiple tables
                sql = """
                      SELECT l.*,
                             GROUP_CONCAT(DISTINCT c.titre_categorie SEPARATOR ',') as categories_list,
                             GROUP_CONCAT(DISTINCT t.tag_libelle SEPARATOR ',')     as tags_list
                      FROM lien l
                               LEFT JOIN lien_categorie lc ON l.url_id = lc.url_id
                               LEFT JOIN categorie c ON lc.categorie_id = c.categorie_id
                               LEFT JOIN lien_tag lt ON l.url_id = lt.url_id
                               LEFT JOIN tag t ON lt.tag_id = t.tag_id
                      GROUP BY l.url_id;
                      """
                cursor.execute(sql)
                records = cursor.fetchall()

                for row in records:
                    # Parse the comma-separated strings back into Python lists
                    tags_string = row.get('tags_list')
                    tags_list = tags_string.split(',') if tags_string else []

                    cats_string = row.get('categories_list')
                    cats_list = cats_string.split(',') if cats_string else []

                    link = Link(
                        link_id=row['url_id'],
                        url=row['url'],
                        title=row['titre_url'],
                        thumbnail_url=row['url_miniature'],
                        platform=row['plateforme'],
                        saved_at=row['date_sauvegarde'],
                        analysis_status=row['statut_analyse'],
                        user_id=row['utilisateur_id'],
                        is_favorite=bool(row.get('is_favorite', 0)),
                        categories=cats_list,  # Changed from category_id/category_name
                        tags=tags_list
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
        Get a specific link by its ID, including its categories and tags.
        """
        connection = DatabaseConnection.get_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)

                sql = """
                      SELECT l.*,
                             GROUP_CONCAT(DISTINCT c.titre_categorie SEPARATOR ',') as categories_list,
                             GROUP_CONCAT(DISTINCT t.tag_libelle SEPARATOR ',')     as tags_list
                      FROM lien l
                               LEFT JOIN lien_categorie lc ON l.url_id = lc.url_id
                               LEFT JOIN categorie c ON lc.categorie_id = c.categorie_id
                               LEFT JOIN lien_tag lt ON l.url_id = lt.url_id
                               LEFT JOIN tag t ON lt.tag_id = t.tag_id
                      WHERE l.url_id = %s
                      GROUP BY l.url_id;
                      """
                cursor.execute(sql, (link_id,))
                row = cursor.fetchone()

                if row:
                    tags_string = row.get('tags_list')
                    tags_list = tags_string.split(',') if tags_string else []

                    cats_string = row.get('categories_list')
                    cats_list = cats_string.split(',') if cats_string else []

                    return Link(
                        link_id=row['url_id'],
                        url=row['url'],
                        title=row['titre_url'],
                        thumbnail_url=row['url_miniature'],
                        platform=row['plateforme'],
                        saved_at=row['date_sauvegarde'],
                        analysis_status=row['statut_analyse'],
                        is_favorite=bool(row.get('is_favorite', 0)),
                        user_id=row['utilisateur_id'],
                        categories=cats_list,
                        tags=tags_list
                    )
            except Exception as e:
                print(f"❌ Error fetching link by ID: {e}")
            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()
        return None

    @staticmethod
    def update_with_details(link, tags: list[str], categories: list[str]) -> bool:
        """
        Updates an existing link's title, and replaces its associated tags and categories.
        Flushes old relationships and inserts the new ones cleanly.
        """
        connection = DatabaseConnection.get_connection()
        if connection:
            try:
                cursor = connection.cursor()

                # --- 1. UPDATE THE LINK (Removed categorie_id) ---
                sql_update_link = """
                                  UPDATE lien
                                  SET titre_url     = %s, \
                                      url_miniature = %s
                                  WHERE url_id = %s \
                                  """
                cursor.execute(sql_update_link, (link.title, link.thumbnail_url, link.link_id))

                # --- 2. FLUSH EXISTING RELATIONSHIPS ---
                cursor.execute("DELETE FROM lien_categorie WHERE url_id = %s", (link.link_id,))
                cursor.execute("DELETE FROM lien_tag WHERE url_id = %s", (link.link_id,))

                # --- 3. RE-INSERT NEW CATEGORIES ---
                if categories:
                    linked_cat_ids = set()
                    for cat_name in categories:
                        cursor.execute("SELECT categorie_id FROM categorie WHERE titre_categorie = %s", (cat_name,))
                        existing_cat = cursor.fetchone()

                        if existing_cat:
                            cat_id = existing_cat[0]
                        else:
                            cursor.execute("INSERT INTO categorie (titre_categorie) VALUES (%s)", (cat_name,))
                            cat_id = cursor.lastrowid

                        if cat_id not in linked_cat_ids:
                            cursor.execute("INSERT INTO lien_categorie (url_id, categorie_id) VALUES (%s, %s)",
                                           (link.link_id, cat_id))
                            linked_cat_ids.add(cat_id)

                # --- 4. RE-INSERT NEW TAGS ---
                if tags:
                    linked_tag_ids = set()
                    for tag_name in tags:
                        cursor.execute("SELECT tag_id FROM tag WHERE tag_libelle = %s", (tag_name,))
                        existing_tag = cursor.fetchone()

                        if existing_tag:
                            tag_id = existing_tag[0]
                        else:
                            cursor.execute("INSERT INTO tag (tag_libelle) VALUES (%s)", (tag_name,))
                            tag_id = cursor.lastrowid

                        if tag_id not in linked_tag_ids:
                            cursor.execute("INSERT INTO lien_tag (url_id, tag_id) VALUES (%s, %s)",
                                           (link.link_id, tag_id))
                            linked_tag_ids.add(tag_id)

                # --- 5. COMMIT EVERYTHING ---
                connection.commit()
                return True

            except Exception as e:
                connection.rollback()
                print(f"❌ Error updating link with details: {e}")
                return False

            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()

        return False

    @staticmethod
    def delete(link_id: int) -> bool:
        """
        Delete the link from the database, if it exists.
        Cascade deletion handles lien_tag and lien_categorie if configured in DB,
        but explicit deletion is safer.
        """
        connection = DatabaseConnection.get_connection()
        if connection:
            try:
                cursor = connection.cursor()

                cursor.execute("DELETE FROM lien_categorie WHERE url_id = %s", (link_id,))
                cursor.execute("DELETE FROM lien_tag WHERE url_id = %s", (link_id,))
                cursor.execute("DELETE FROM lien WHERE url_id = %s", (link_id,))

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

    @staticmethod
    def toggle_favorite(link_id: int, is_favorite: bool) -> bool:
        """
        Updates the 'is_favorite' status of a specific link.
        """
        connection = DatabaseConnection.get_connection()
        if connection:
            try:
                cursor = connection.cursor()
                sql = "UPDATE lien SET is_favorite = %s WHERE url_id = %s"
                cursor.execute(sql, (is_favorite, link_id))
                connection.commit()
                return True
            except Exception as e:
                connection.rollback()
                print(f"❌ Error updating favorite status: {e}")
                return False
            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()
        return False
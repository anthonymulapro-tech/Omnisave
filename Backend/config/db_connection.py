import mysql.connector
from mysql.connector import Error


class DatabaseConnection:
    @staticmethod
    def get_connection():
        """
        Établit et retourne la connexion à la base de données MySQL.
        """
        try:
            connection = mysql.connector.connect(
                host='localhost',
                user='root',
                password='',  # Volontairement vide pour Laragon
                database='omnisave'
            )

            if connection.is_connected():
                return connection

        except Error as e:
            print(f"❌ Erreur de connexion à MySQL : {e}")
            return None


# Petit test rapide pour vérifier que tout fonctionne
if __name__ == "__main__":
    conn = DatabaseConnection.get_connection()
    if conn:
        print("✅ Connexion réussie à la base Omnisave !")
        conn.close()
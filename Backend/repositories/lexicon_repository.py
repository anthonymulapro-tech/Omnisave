from config.db_connection import DatabaseConnection

class LexiconRepository:

    @staticmethod
    def add_suggestion(word, category):
        """
        Adds a newly proposed word or increments its counter if it already exists
        for the given category.
        """
        # Sanitize the inputs to prevent duplicates (e.g., "Workout" vs "workout")
        clean_word = word.strip().lower()
        clean_category = category.strip().lower()

        connection = DatabaseConnection.get_connection()
        if not connection:
            return False, "Database connection failed"

        try:
            cursor = connection.cursor()

            # MySQL magic: if the (word, proposed_category) pair already exists,
            # it triggers the UPDATE action and increments the occurrences counter
            sql = """
                  INSERT INTO lexicon_suggestion (word, proposed_category, occurrences)
                  VALUES (%s, %s, 1)
                  ON DUPLICATE KEY UPDATE occurrences = occurrences + 1
                  """

            cursor.execute(sql, (clean_word, clean_category))
            connection.commit()
            return True, None

        except Exception as e:
            print(f"❌ Error adding suggestion: {e}")
            connection.rollback()
            return False, str(e)

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

# --- QUICK TEST ---
if __name__ == "__main__":
    print("--- Testing LexiconRepository ---")

    # Test 1: First insertion (should create the row with occurrences = 1)
    print("\n1. Simulating first user adding 'zelda' to 'gaming'...")
    success, err = LexiconRepository.add_suggestion("zelda", "gaming")
    if success:
        print("✅ Success! 'zelda' added.")
    else:
        print(f"❌ Error: {err}")

    # Test 2: Second insertion of the SAME word (should increment occurrences to 2)
    # We use caps ("ZELDA") to test if your .lower() cleaning works!
    print("\n2. Simulating second user adding 'ZELDA' to 'Gaming'...")
    success, err = LexiconRepository.add_suggestion("ZELDA", "Gaming")
    if success:
        print("✅ Success! Counter should now be at 2.")
    else:
        print(f"❌ Error: {err}")
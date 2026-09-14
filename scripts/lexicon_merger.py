import json
import os
import sys

# Add the project root to the path so we can import the database connection
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config.db_connection import DatabaseConnection

# Paths to both lexicons
BASE_LEXICON_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'lexicon.json'))
COMMUNITY_LEXICON_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', 'data', 'community_lexicon.json'))

# Progression tiers based on your existing scoring system
TIER_PROGRESSION = [
    {"min_occ": 15, "group": "core_fr", "points": 300},
    {"min_occ": 10, "group": "strong_fr", "points": 150},
    {"min_occ": 5, "group": "medium_fr", "points": 50},
    {"min_occ": 3, "group": "bonus_fr", "points": 15}
]


def load_json(filepath):
    """Loads a JSON file or returns an empty dictionary if it doesn't exist."""
    if not os.path.exists(filepath):
        return {}
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_word_tier(category_data, word):
    """
    Finds the current group and points of a word in a given category.
    Returns the group name and points, or (None, 0) if not found.
    """
    for group_name, group_data in category_data.get("groups", {}).items():
        if word in group_data.get("words", []):
            return group_name, group_data.get("points", 0)
    return None, 0


def init_category_scaffold(category_name, lexicon_dict):
    """Initializes the empty tier structure for a brand new category."""
    print(f"🌟 INIT NEW CATEGORY: {category_name.capitalize()}")
    lexicon_dict[category_name] = {
        "coefficient": 1.0,
        "groups": {
            "core_fr": {"points": 300, "words": []},
            "strong_fr": {"points": 150, "words": []},
            "medium_fr": {"points": 50, "words": []},
            "bonus_fr": {"points": 15, "words": []}
        }
    }


def merge_community_lexicon():
    print("🚀 Starting Community Lexicon Merger...")

    # Load both lexicons
    base_lexicon = load_json(BASE_LEXICON_PATH)
    community_lexicon = load_json(COMMUNITY_LEXICON_PATH)

    connection = DatabaseConnection.get_connection()
    if not connection:
        print("❌ Database connection failed.")
        return

    try:
        cursor = connection.cursor(dictionary=True)

        # --- STEP 1: VALIDATE NEW CATEGORIES ---
        # A category officially enters the community lexicon if it has >= 5 occurrences overall
        cursor.execute("""
                       SELECT proposed_category, SUM(occurrences) as total_occ
                       FROM lexicon_suggestion
                       GROUP BY proposed_category
                       HAVING total_occ >= 5
                       """)
        valid_categories = cursor.fetchall()

        for cat_row in valid_categories:
            cat_name = cat_row['proposed_category'].lower().strip()

            # If it's a completely new category (not in base AND not in community)
            if cat_name not in base_lexicon and cat_name not in community_lexicon:
                init_category_scaffold(cat_name, community_lexicon)
            # If it exists in base but not in community yet, we also need to scaffold it in community
            elif cat_name in base_lexicon and cat_name not in community_lexicon:
                init_category_scaffold(cat_name, community_lexicon)

        # --- STEP 2: PROMOTE WORDS (TAGS) ---
        # Fetch all words with at least 5 occurrences
        cursor.execute("""
                       SELECT proposed_category, word, occurrences
                       FROM lexicon_suggestion
                       WHERE occurrences >= 5
                       """)
        valid_words = cursor.fetchall()

        for row in valid_words:
            cat_name = row['proposed_category'].lower().strip()
            word = row['word'].lower().strip()
            occ = row['occurrences']

            # Ensure the category is ready in the community dictionary
            if cat_name not in community_lexicon:
                continue

            # SECURITY: Check if the word is already in the BASE official lexicon
            if cat_name in base_lexicon:
                base_group, _ = get_word_tier(base_lexicon[cat_name], word)
                if base_group:
                    # Skip it, you already hardcoded this word officially
                    continue

            # Determine target tier based on occurrences
            target_group = None
            target_points = 0
            for tier in TIER_PROGRESSION:
                if occ >= tier["min_occ"]:
                    target_group = tier["group"]
                    target_points = tier["points"]
                    break

            if not target_group:
                continue

            # Where is the word currently in the community lexicon?
            current_group, current_points = get_word_tier(community_lexicon[cat_name], word)

            # Promotion logic: only move if the new points are higher
            if current_points < target_points:
                # Remove from old group if it was already in the community lexicon
                if current_group:
                    community_lexicon[cat_name]["groups"][current_group]["words"].remove(word)

                # Add to the new target group
                community_lexicon[cat_name]["groups"][target_group]["words"].append(word)

                if current_group:
                    print(
                        f"📈 LEVEL UP: '{word}' in '{cat_name}' moved from {current_group} to {target_group} (Occurrences: {occ})")
                else:
                    print(f"✅ NEW WORD: '{word}' added to {target_group} in '{cat_name}'")

        # --- STEP 3: SAVE COMMUNITY JSON ---
        with open(COMMUNITY_LEXICON_PATH, 'w', encoding='utf-8') as f:
            json.dump(community_lexicon, f, indent=2, ensure_ascii=False)

        print("💾 community_lexicon.json successfully updated!")

    except Exception as e:
        print(f"❌ Error during merging: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


if __name__ == "__main__":
    merge_community_lexicon()
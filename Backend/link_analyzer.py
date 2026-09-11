import json
import spacy
import os
import re
from collections import Counter


class LinkAnalyzer:
    def __init__(self, lexicon_path, blacklist_path):
        """Initializes the analyzer by loading the lexicon, blacklist, and NLP model."""
        # 1. Load the scoring lexicon
        with open(lexicon_path, 'r', encoding='utf-8') as file:
            self.lexicon = json.load(file)

        # 2. Load the custom blacklist JSON
        with open(blacklist_path, 'r', encoding='utf-8') as file:
            blacklist_data = json.load(file)

        # Flatten all lists from the JSON into a single fast-lookup Set
        self.noise_words = set()
        for words_list in blacklist_data.values():
            self.noise_words.update(words_list)

        print("Loading spaCy NLP model (fr_core_news_sm)...")
        self.nlp = spacy.load("fr_core_news_sm")

    def _log_unknown_words(self, doc):
        """Extracts relevant words from an uncategorized document and saves them for review."""
        useful_words = set()
        for token in doc:
            if token.pos_ in ['NOUN', 'PROPN', 'VERB'] and not token.is_stop and token.is_alpha:
                useful_words.add(token.lemma_.lower())

        if useful_words:
            filepath = os.path.join(os.path.dirname(__file__), "unknown_words.txt")
            with open(filepath, "a", encoding="utf-8") as f:
                f.write(f"--- Words extracted from UNCATEGORIZED post ---\n")
                f.write(", ".join(useful_words) + "\n\n")

    def _extract_tags(self, text, doc, limit=5):
        """
        Hybrid extraction: Prioritizes explicit hashtags but filters out junk (e.g., adjectives),
        then completes the list with the most relevant text keywords if needed.
        """
        final_tags = []

        # --- STEP 1: Hashtag Rescue & Filtering ---
        # Extract all hashtags present in the original text
        hashtags = re.findall(r'#(\w+)', text)

        for tag in hashtags:
            tag_lower = tag.lower()

            # Reject if the tag is in the JSON blacklist or too short
            if tag_lower in self.noise_words or len(tag_lower) < 2:
                continue

            # Analyze this specific tag using spaCy to determine its part of speech
            tag_doc = self.nlp(tag_lower)

            # Discard descriptive adjectives (e.g., 'bon', 'délicieux'), adverbs, or pronouns
            if tag_doc and tag_doc[0].pos_ in ['ADJ', 'ADV', 'PRON', 'DET']:
                continue

            # Keep valid words (unknown words like 'mcchicken' default to NOUN/PROPN in spaCy)
            # Ensure no duplicates are added
            if tag_lower not in final_tags:
                final_tags.append(tag_lower)

        # --- STEP 2: Fill remaining slots with text keywords ---
        # If the hashtag count is below the required limit, parse the main text
        if len(final_tags) < limit:
            text_keywords = []

            for token in doc:
                word = token.lemma_.lower()

                # Keep Nouns and Proper Nouns that pass the noise and length filters
                if (token.pos_ in ['NOUN', 'PROPN']
                        and not token.is_stop
                        and len(word) > 2
                        and word not in self.noise_words
                        and word not in final_tags):  # Prevent duplicates with extracted hashtags

                    text_keywords.append(word)

            # Calculate how many more tags are needed to reach the limit
            needed = limit - len(final_tags)

            # Append the most frequent keywords to fill the remaining slots
            most_common = [word for word, count in Counter(text_keywords).most_common(needed)]
            final_tags.extend(most_common)

        return final_tags[:limit]

    def analyze(self, text):
        """Analyzes the text and returns the category and tags."""
        scores = {category: 0 for category in self.lexicon.keys()}
        doc = self.nlp(text)

        for token in doc:
            if token.is_punct or token.is_space:
                continue

            root_word = token.lemma_.lower()
            grammatical_role = token.dep_

            grammar_multiplier = 1.0
            if grammatical_role in ["ROOT", "nsubj", "nsubj:pass"]:
                grammar_multiplier = 1.5
            elif grammatical_role in ["obl"]:
                grammar_multiplier = 0.5

            for category, data in self.lexicon.items():
                coef = data.get("coefficient", 1.0)
                for group_name, group_data in data.get("groups", {}).items():
                    points = group_data["points"]
                    words = [w.lower() for w in group_data["words"]]

                    if root_word in words:
                        scores[category] += (points * coef * grammar_multiplier)

        best_category = self._determine_winner(scores)

        if best_category == "Non catégorisé":
            self._log_unknown_words(doc)

        tags = self._extract_tags(text, doc)

        return {
            "category": best_category,
            "tags": tags
        }

    def _determine_winner(self, scores):
        """Finds the category with the highest score."""
        minimum_threshold = 50
        best_category = max(scores, key=scores.get)

        if scores[best_category] < minimum_threshold:
            return "Non catégorisé"
        return best_category


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    lexicon_path = os.path.join(base_dir, 'data', 'lexicon.json')
    blacklist_path = os.path.join(base_dir, 'data', 'blacklist.json')

    analyzer = LinkAnalyzer(lexicon_path, blacklist_path)

    instagram_post = """
   Voici quelques exercices à mettre en place pour débloquer tes chevilles !

⸻
🌿team @nutripurefr
Tu peux profiter de -10% avec le code « MOBILITY » sur tout le site.
#mobilité #mobility #coach #coachsportif #etirements
    """

    print("\n--- TEST: INSTAGRAM POST ---")
    result = analyzer.analyze(instagram_post)
    print(json.dumps(result, indent=2, ensure_ascii=False))
import json
import spacy
import os
import re
from collections import Counter

import json
import spacy
import os
import re
from collections import Counter


class LinkAnalyzer:
    def __init__(self, lexicon_path, blacklist_path, community_lexicon_path=None):
        """Initializes the analyzer by loading lexicons, blacklist, and NLP model."""
        self.lexicon_path = lexicon_path
        self.blacklist_path = blacklist_path
        self.community_lexicon_path = community_lexicon_path

        self.lexicon = {}
        self.noise_words = set()

        # Trackers
        self.last_lexicon_mtime = 0
        self.last_community_mtime = 0

        # Loading data
        self._load_data()

        print("Loading spaCy NLP model (fr_core_news_sm)...")
        self.nlp = spacy.load("fr_core_news_sm")

    def _get_mtime(self, filepath):
        """Returns the last modification time of a file, or 0 if it doesn't exist."""
        if filepath and os.path.exists(filepath):
            return os.path.getmtime(filepath)
        return 0

    def _check_and_reload(self):
        """Checks if JSON files have changed on disk, and reloads them if necessary."""
        current_lexicon_mtime = self._get_mtime(self.lexicon_path)
        current_community_mtime = self._get_mtime(self.community_lexicon_path)

        if (current_lexicon_mtime > self.last_lexicon_mtime or
                current_community_mtime > self.last_community_mtime):
            print("🔄 Détection de nouveaux mots communautaires... Mise à jour du cerveau de l'IA en cours !")
            self._load_data()

    def _load_data(self):
        """Loads and merges the lexicons and blacklist into memory."""
        self.lexicon = {}

        # 1. Load the BASE scoring lexicon
        if os.path.exists(self.lexicon_path):
            with open(self.lexicon_path, 'r', encoding='utf-8') as file:
                self.lexicon = json.load(file)
            self.last_lexicon_mtime = self._get_mtime(self.lexicon_path)
        else:
            print(f"⚠️ Warning: Base lexicon not found at {self.lexicon_path}")

        # 2. Load and MERGE the COMMUNITY lexicon (if it exists)
        if self.community_lexicon_path and os.path.exists(self.community_lexicon_path):
            with open(self.community_lexicon_path, 'r', encoding='utf-8') as file:
                community_data = json.load(file)

            self.last_community_mtime = self._get_mtime(self.community_lexicon_path)

            # Merge the community data into the main lexicon in memory
            for cat, data in community_data.items():
                if cat not in self.lexicon:
                    self.lexicon[cat] = data
                else:
                    for group_name, group_data in data.get("groups", {}).items():
                        if group_name not in self.lexicon[cat].get("groups", {}):
                            self.lexicon[cat]["groups"][group_name] = group_data
                        else:
                            # Combine words without duplicates
                            existing_words = set(self.lexicon[cat]["groups"][group_name]["words"])
                            new_words = set(group_data["words"])
                            self.lexicon[cat]["groups"][group_name]["words"] = list(existing_words.union(new_words))

        # 3. Load the custom blacklist JSON
        if os.path.exists(self.blacklist_path):
            with open(self.blacklist_path, 'r', encoding='utf-8') as file:
                blacklist_data = json.load(file)

            self.noise_words = set()
            for words_list in blacklist_data.values():
                self.noise_words.update(words_list)

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
        final_tags = []
        hashtags = re.findall(r'#(\w+)', text)

        for tag in hashtags:
            tag_lower = tag.lower()
            if tag_lower in self.noise_words or len(tag_lower) < 2:
                continue
            tag_doc = self.nlp(tag_lower)
            if tag_doc and tag_doc[0].pos_ in ['ADJ', 'ADV', 'PRON', 'DET']:
                continue
            if tag_lower not in final_tags:
                final_tags.append(tag_lower)

        if len(final_tags) < limit:
            text_keywords = []
            for token in doc:
                word = token.lemma_.lower()
                if (token.pos_ in ['NOUN', 'PROPN'] and not token.is_stop and len(word) > 2
                        and word not in self.noise_words and word not in final_tags):
                    text_keywords.append(word)

            needed = limit - len(final_tags)
            most_common = [word for word, count in Counter(text_keywords).most_common(needed)]
            final_tags.extend(most_common)

        return final_tags[:limit]

    def analyze(self, text):
        """Analyzes the text and returns the categories and tags."""
        self._check_and_reload()

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

        best_categories = self._determine_winners(scores)

        if "Non catégorisé" in best_categories:
            self._log_unknown_words(doc)

        raw_tags = self._extract_tags(text, doc)
        cleaned_tags = list(dict.fromkeys(tag.strip().lower() for tag in raw_tags))

        return {
            "categories": best_categories,
            "tags": cleaned_tags
        }

    def _determine_winners(self, scores):
        """Trouve toutes les catégories pertinentes dépassant le seuil (Max 5)."""
        minimum_threshold = 50

        valid_categories = {cat: score for cat, score in scores.items() if score >= minimum_threshold}

        if not valid_categories:
            return ["Non catégorisé"]

        sorted_categories = sorted(valid_categories.keys(), key=lambda k: valid_categories[k], reverse=True)

        return sorted_categories[:5]


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    lexicon_path = os.path.join(base_dir, 'data', 'lexicon.json')
    blacklist_path = os.path.join(base_dir, 'data', 'blacklist.json')

    # Path for the community lexicon
    community_lexicon_path = os.path.join(base_dir, 'data', 'community_lexicon.json')

    # Initialize with the 3 files
    analyzer = LinkAnalyzer(lexicon_path, blacklist_path, community_lexicon_path)

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
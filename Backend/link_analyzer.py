import re
import json


class LinkAnalyzer:
    def __init__(self, json_path):
        self.lexicon = self._load_lexicon(json_path)

    def _load_lexicon(self, path):
        try:
            with open(path, 'r', encoding='utf-8') as file:
                return json.load(file)
        except FileNotFoundError:
            print(f"[CRITICAL ERROR] The file {path} was not found.")
            return None

    def clean_text(self, text):
        return re.findall(r'[a-zà-ÿ]{3,}', text.lower())

    def _create_flexible_pattern(self, keyword):
        p = keyword.lower()
        p = p.replace('e', '[eéèêë]')
        p = p.replace('i', '[iîï]')
        p = p.replace('a', '[aàâä]')
        p = p.replace('u', '[uûüù]')
        return rf"^{p}(s|x|es)?$"

    def calculate_scores(self, extracted_words):
        if self.lexicon is None:
            return {}, {}

        raw_scores = {category: 0 for category in self.lexicon.keys()}

        for raw_word in extracted_words:
            for category, config in self.lexicon.items():
                reference_dict = config.get("keywords", {})

                for level, word_list in reference_dict.items():
                    for keyword in word_list:
                        pattern = self._create_flexible_pattern(keyword)

                        if re.fullmatch(pattern, raw_word):
                            if keyword == "recette":
                                raw_scores[category] += 150
                            elif keyword == "entreprise":
                                raw_scores[category] += 100
                            else:
                                raw_scores[category] += 50 if level == "master" else 20
                            break

        final_scores = {}
        for category, points in raw_scores.items():
            coef = self.lexicon[category].get("coefficient", 1.0)
            final_scores[category] = round(points * coef, 2)

        return raw_scores, final_scores

    def determine_winner(self, points):
        if not points or max(points.values()) == 0:
            return None

        score_winner = max(points, key=points.get)
        c = points.get("cooking", 0)
        s = points.get("sports", 0)

        if c > 0 and c >= s:
            if points[score_winner] > c:
                return score_winner
            return "cooking"
        return score_winner

    def analyze(self, text):
        if self.lexicon is None:
            print("SYSTEM ERROR: Analysis impossible (lexicon missing).")
            return "SYSTEM_ERROR"

        extracted_words = self.clean_text(text)
        raw_scores, final_scores = self.calculate_scores(extracted_words)
        result = self.determine_winner(final_scores)

        print("--- ANALYSIS COMPLETE ---")
        print(f"Analyzed text: '{text}'")
        print(f"Raw scores: {raw_scores}")
        print(f"Final scores: {final_scores}")

        if result is None:
            print("No keywords associated with the current categories were found. Please update the lexicon.")
        else:
            print(f"Final result: {result}")
        print("------------------------\n")

        return result


if __name__ == '__main__':

    analyzer = LinkAnalyzer("../data/lexicon.json")

    analyzer.analyze("Le restaurant est super ici!")
    analyzer.analyze("La nouvelle recette pour mon entraînement en musculation!")
    analyzer.analyze("Mon entraînement est savoureux, remplis de saveur, je finis pas cuit à la fin")
    analyzer.analyze("Les recettes de mon entreprise en 2025")
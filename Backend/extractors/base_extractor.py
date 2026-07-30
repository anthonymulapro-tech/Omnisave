class BaseExtractor:
    def extract_text(self, url: str) -> str:
        """Méthode que tous les extracteurs enfants devront implémenter."""
        raise NotImplementedError("Cette méthode doit être écrasée par la classe enfant.")
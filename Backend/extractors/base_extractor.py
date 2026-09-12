class BaseExtractor:
    def extract_data(self, url: str) -> dict:
        """
        Method that all child extractors must implement.
        Returns a dictionary containing text, title, author, and thumbnail.
        """
        raise NotImplementedError("This method must be overridden by the child class.")
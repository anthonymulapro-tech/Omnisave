from typing import Optional, Dict, Any


class Category:
    """
    Model representing a category in the Omnisave application.
    Acts as a bridge between the MySQL 'categorie' table and the Python logic.
    """

    def __init__(self, category_id: Optional[int] = None, title: str = "", description: str = ""):
        self.category_id = category_id
        self.title = title
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        """
        Converts the Python object into a dictionary.
        Essential for Flask to return this data as a JSON response to React.
        """
        return {
            "category_id": self.category_id,
            "title": self.title,
            "description": self.description
        }

    def __repr__(self) -> str:
        """
        Provides a readable string representation of the object for debugging.
        """
        return f"<Category {self.category_id} - {self.title}>"
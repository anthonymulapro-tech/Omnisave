from datetime import datetime
from typing import Optional, Dict, Any

class Link:
    """
    Model representing a saved link in the Omnisave application.
    Acts as a bridge between the MySQL 'lien' table and the Python logic.
    Now supports multiple categories (up to 5 enforced by business logic).
    """

    def __init__(
        self,
        link_id: Optional[int] = None,
        url: str = "",
        title: Optional[str] = None,
        thumbnail_url: Optional[str] = None,
        platform: Optional[str] = None,
        saved_at: Optional[datetime] = None,
        analysis_status: str = "PENDING",
        is_favorite: bool = False,
        user_id: Optional[int] = None,
        categories: Optional[list[str]] = None,
        tags: Optional[list[str]] = None
    ):
        self.link_id = link_id
        self.url = url
        self.title = title
        self.thumbnail_url = thumbnail_url
        self.platform = platform
        self.saved_at = saved_at
        self.analysis_status = analysis_status
        self.is_favorite = is_favorite
        self.user_id = user_id

        # Default to empty lists to prevent NoneType iteration errors in the frontend
        self.categories = categories if categories is not None else []
        self.tags = tags if tags is not None else []

    def to_dict(self) -> Dict[str, Any]:
        """
        Converts the Python object into a dictionary for JSON serialization.
        Handles datetime conversion to ISO 8601 string format for React.
        """
        return {
            "link_id": self.link_id,
            "url": self.url,
            "title": self.title,
            "thumbnail_url": self.thumbnail_url,
            "platform": self.platform,
            "saved_at": self.saved_at.isoformat() if self.saved_at else None,
            "analysis_status": self.analysis_status,
            "is_favorite": self.is_favorite,
            "user_id": self.user_id,
            "categories": self.categories, # Now returns a list of strings
            "tags": self.tags
        }

    def __repr__(self) -> str:
        """
        Provides a readable string representation of the object for debugging.
        """
        return f"<Link {self.link_id} - {self.url} [{self.analysis_status}]>"
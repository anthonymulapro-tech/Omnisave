from datetime import datetime
from models.link import Link


def test_link_initialization_defaults():
    """Verifies that a Link object gets the correct default values when minimal data is provided."""
    # Arrange & Act
    minimal_link = Link(url="https://www.tiktok.com/@user/video/123456")

    # Assert
    assert minimal_link.url == "https://www.tiktok.com/@user/video/123456"
    assert minimal_link.analysis_status == "PENDING"
    assert minimal_link.title is None
    assert minimal_link.saved_at is None


def test_link_full_initialization():
    """Verifies that a Link object correctly assigns all provided fields."""
    # Arrange & Act
    dt = datetime(2026, 9, 10, 14, 30, 0)
    full_link = Link(
        link_id=1,
        url="https://youtube.com/watch?v=123",
        title="Recette de cuisine facile",
        thumbnail_url="https://img.youtube.com/123.jpg",
        platform="YouTube",
        saved_at=dt,
        category_id=2,
        user_id=1,
        analysis_status="COMPLETED"
    )

    # Assert
    assert full_link.title == "Recette de cuisine facile"
    assert full_link.analysis_status == "COMPLETED"
    assert full_link.saved_at == dt


def test_link_to_dict():
    """Verifies the dictionary conversion, especially the crucial datetime ISO format conversion."""
    # Arrange
    dt = datetime(2026, 9, 10, 15, 0, 0)
    link = Link(
        link_id=10,
        url="https://x.com/tech_post",
        saved_at=dt,
        analysis_status="FAILED"
    )

    # Act
    result = link.to_dict()

    # Assert
    assert result["link_id"] == 10
    assert result["url"] == "https://x.com/tech_post"
    assert result["analysis_status"] == "FAILED"
    assert result["saved_at"] == "2026-09-10T15:00:00"
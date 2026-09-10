from models.category import Category


def test_category_initialization():
    """Vérifie que l'objet Category se crée correctement avec les bonnes valeurs."""
    # Arrange & Act
    cat = Category(category_id=1, title="Sport", description="Physical activities")

    # Assert
    assert cat.category_id == 1
    assert cat.title == "Sport"
    assert cat.description == "Physical activities"


def test_category_to_dict():
    """Vérifie que la conversion en dictionnaire (pour le JSON) est exacte."""
    # Arrange
    cat = Category(category_id=2, title="Finance", description="Money matters")

    # Act
    result = cat.to_dict()

    # Assert
    assert result == {
        "category_id": 2,
        "title": "Finance",
        "description": "Money matters"
    }
from repositories.category_repository import CategoryRepository
from repositories.link_repository import LinkRepository
from models.link import Link


def run_integration_tests():
    """
    Runs integration tests to verify database connectivity and repository logic.
    Ensure that you have at least one user (ID: 1) and one category (ID: 1) in your DB.
    """

    print("=== Testing CategoryRepository ===")
    categories = CategoryRepository.get_all()
    if categories:
        print(f"✅ Success: Found {len(categories)} categories.")
        for cat in categories:
            print(f"  -> {cat}")
    else:
        print("⚠️ No categories found or connection failed.")

    print("\n=== Testing LinkRepository (CREATE) ===")
    # Create a dummy link to test the INSERT query
    # Replace category_id and user_id with actual IDs existing in your database
    new_link = Link(
        url="https://github.com/anthony-mula/omnisave",
        title="Omnisave GitHub Repository",
        platform="GitHub",
        category_id=1,  # MUST exist in 'categorie' table
        user_id=1  # MUST exist in 'utilisateur' table
    )

    success = LinkRepository.create(new_link)

    if success:
        print(f"✅ Success: Link inserted! MySQL auto-generated ID: {new_link.link_id}")
    else:
        print("❌ Failed to insert the link. Check your console for SQL errors.")

    print("\n=== Testing LinkRepository (READ) ===")
    links = LinkRepository.get_all()
    if links:
        print(f"✅ Success: Found {len(links)} links.")
        for link in links:
            print(f"  -> {link}")
    else:
        print("⚠️ No links found.")


if __name__ == "__main__":
    run_integration_tests()
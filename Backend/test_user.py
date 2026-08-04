from models.user import User
from repositories.user_repository import UserRepository

# 1. We create a "pure" Python object (it only exists in the computer's memory for now)
new_user = User(
    email="anthony.test@omnisave.com",
    password="super_secure_password",
    first_name="Anthony",
    last_name="Mula",
    country="France"
)

# 2. We use the Repository to send this object to the MySQL database
print("--- Attempting to create a user ---")
saved_user = UserRepository.create(new_user)

# 3. We verify that the Repository can fetch it back
if saved_user:
    print("\n--- Attempting to fetch the user by email ---")
    fetched_user = UserRepository.get_by_email("anthony.test@omnisave.com")

    if fetched_user:
        print("✅ User found in DB!")
        print(fetched_user.to_dict())
class User:
    def __init__(self, email, password, first_name=None, last_name=None, country=None, role_id=1, is_active=True, user_id=None, created_at=None):
        """
        Represents a user in the Omnisave application.
        Parameters are ordered to highlight mandatory fields (NOT NULL in SQL).
        """
        self.user_id = user_id
        self.email = email
        self.password = password
        self.first_name = first_name
        self.last_name = last_name
        self.country = country
        self.is_active = is_active
        self.created_at = created_at
        self.role_id = role_id

    def to_dict(self):
        """
        Transforms the object into a dictionary, highly useful for returning JSON to the React frontend.
        """
        return {
            "user_id": self.user_id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "country": self.country,
            "is_active": self.is_active,
            "role_id": self.role_id,
            "created_at": str(self.created_at) if self.created_at else None
            # The password is NEVER returned in the dictionary for security reasons!
        }
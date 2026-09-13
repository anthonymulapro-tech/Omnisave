class User:
    def __init__(self, email, password, first_name=None, last_name=None,
                 pseudo=None, profile_picture=None, fast_save=False,
                 country=None, role_id=1, is_active=True, user_id=None, created_at=None):
        """
        Represents a user in the Omnisave application.
        Parameters are ordered to highlight mandatory fields (NOT NULL in SQL).
        """
        self.user_id = user_id
        self.email = email
        self.password = password
        self.first_name = first_name
        self.last_name = last_name

        # New profile fields
        self.pseudo = pseudo
        self.profile_picture = profile_picture
        self.fast_save = fast_save

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

            # Adding the new fields to the API response
            "pseudo": self.pseudo,
            "profile_picture": self.profile_picture,
            "fast_save": bool(self.fast_save),  # Ensure it's a boolean for JSON

            "country": self.country,
            "is_active": self.is_active,
            "role_id": self.role_id,
            "created_at": str(self.created_at) if self.created_at else None
            # The password is NEVER returned in the dictionary for security reasons!
        }
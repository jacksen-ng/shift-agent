class LoginEntity:
    def __init__(self, email, password):
        self.email = email
        self.password = password
        
    def to_json(self):
        login_entity_to_json = {
            "email": self.email,
            "password": self.password
        }
        return login_entity_to_json

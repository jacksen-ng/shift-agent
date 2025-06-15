class LoginEntity:
    def __init__(self, email, password):
        self.email = email
        self.password = password
        
    def toJson(self):
        login_entity_toJson = {
            "email": self.email,
            "password": self.password
        }
        return login_entity_toJson

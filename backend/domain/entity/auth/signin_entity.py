class SigninEntity:
    def __init__(self, email, password, confirm_password, role):
        self.email = email
        self.password = password
        self.confirm_password = confirm_password
        self.role = role
        
    def toJson(self):
        signin_entity_toJson = {
            "email": self.email,
            "password": self.password,
            "confirm_password": self.confirm_password,
            "role": self.role
        }
        return signin_entity_toJson
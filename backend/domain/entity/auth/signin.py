class SigninEntity:
    def __init__(self, email, password, confirm_password, role, company_id=None):
        self.email = email
        self.password = password
        self.confirm_password = confirm_password
        self.role = role
        self.company_id = company_id
        
    def to_json(self):
        signin_entity_to_json = {
            "email": self.email,
            "password": self.password,
            "confirm_password": self.confirm_password,
            "role": self.role,
            "company_id": self.company_id
        }
        return signin_entity_to_json
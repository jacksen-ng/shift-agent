class TokenEntity:
    def __init__(self, access_token):
        self.access_token = access_token
        
    def toJson(self):
        token_entity_toJson = {
            "access_token": self.access_token
        }
        return token_entity_toJson
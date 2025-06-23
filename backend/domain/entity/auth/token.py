class TokenEntity:
    def __init__(self, access_token):
        self.access_token = access_token
        
    def to_json(self):
        token_entity_to_json = {
            "access_token": self.access_token
        }
        return token_entity_to_json
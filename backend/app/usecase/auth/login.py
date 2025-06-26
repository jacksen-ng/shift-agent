from ....domain.validation.objects.user import user_validation
from ....domain.entity.auth import auth_entities
from ...repository.firebase.firebase_auth import FirebaseAuthService
from ...repository.crud.auth.login_request import login_request
from ...service.auth.save_cookie import save_id_token_cookie
from fastapi import Response

class LoginUsecase:
    def __init__(self, email, password):
        self.email = email
        self.password = password
        
    def execute(self, response: Response):
        email_validation = user_validation['EmailValidation'](self.email).execute()
        
        values = auth_entities['LoginEntity'](email_validation, self.password).to_json()
        
        firebase_auth = FirebaseAuthService()
        auth_values = firebase_auth.login_user(values['email'], values['password'])
        
        if auth_values['success']:
            login_request(auth_values['firebase_uid'])
            save_id_token_cookie(response, auth_values['id_token'])
        else:
            raise Exception("Failed to login")
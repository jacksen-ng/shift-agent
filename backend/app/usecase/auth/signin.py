from ....domain.validation.objects.user import user_validation
from ....domain.entity.auth import auth_entities
from ...repository.firebase.firebase_auth import FirebaseAuthService
from ...repository.crud.auth.signin_request import signin_request_owner, signin_request_crew

class SigninUsecase:
    def __init__(self, email, password, confirm_password, role):
        self.email = email
        self.password = password
        self.confirm_password = confirm_password
        self.role = role

    def execute(self):
        email_validation = user_validation['email_validation'](self.email).execute()
        role_validation = user_validation['role_validation'](self.role).execute()
        
        values = auth_entities['SigninEntity'](email_validation, self.password, self.confirm_password, role_validation).to_json()
        
        if values['role'] == 'owner':
            firebase_auth = FirebaseAuthService()
            auth_values = firebase_auth.create_user(values['email'], values['password'], values['role'])

            if auth_values['success']:
                signin_request_owner(auth_values['firebase_uid'], values['email'], values['role'])
            else:
                raise Exception("Failed to create user")
        
        elif values['role'] == 'crew':
            firebase_auth = FirebaseAuthService()
            auth_values = firebase_auth.create_user(values['email'], values['password'], values['role'])

            if auth_values['success']:
                signin_request_crew(auth_values['firebase_uid'], values['email'], values['role'])
            else:
                raise Exception("Failed to create user")
            
        else:
            raise Exception("Invalid role")
    
                


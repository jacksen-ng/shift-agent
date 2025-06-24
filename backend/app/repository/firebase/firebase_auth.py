import os
import sys
from typing import Dict, Optional
import firebase_admin
from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))

from secret_manager.secret_key import initialize_firebase

class FirebaseAuthService:
    def __init__(self): 
        PROJECT_ID = "jacksen-server"
        SECRET_ID = "firebase-secret-credential"
        self.app = initialize_firebase(PROJECT_ID, SECRET_ID)
    
    def create_user(self, email: str, password: str, display_name: Optional[str] = None) -> Dict:
        try:
            user_record = auth.create_user(
                email=email,
                password=password,
                display_name=display_name,
                email_verified=False
            )
            
            custom_token = auth.create_custom_token(user_record.uid)
            
            return {
                "success": True,
                "custom_token": custom_token.decode('utf-8'),
            }
            
        except FirebaseError as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def verify_id_token(self, id_token: str) -> Dict:
        try:
            decoded_token = auth.verify_id_token(id_token)
            
            return {
                "success": True,
                "email": decoded_token.get('email'),
                "firebase_uid": decoded_token['uid'],
            }
            
        except FirebaseError as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def get_user_by_email(self, email: str) -> Dict:
        try:
            user_record = auth.get_user_by_email(email)
            
            return {
                "success": True,
                "user_id": user_record.uid,
                "email": user_record.email,
                "display_name": user_record.display_name,
                "email_verified": user_record.email_verified,
                "creation_time": user_record.user_metadata.creation_timestamp,
                "last_sign_in": user_record.user_metadata.last_sign_in_timestamp,
            }
            
        except FirebaseError as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def get_user_by_uid(self, uid: str) -> Dict:
        try:
            user_record = auth.get_user(uid)
            
            return {
                "success": True,
                "user_id": user_record.uid,
                "email": user_record.email,
                "display_name": user_record.display_name,
                "email_verified": user_record.email_verified,
                "creation_time": user_record.user_metadata.creation_timestamp,
                "last_sign_in": user_record.user_metadata.last_sign_in_timestamp,
            }
            
        except FirebaseError as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def update_user(self, uid: str, email: Optional[str] = None, password: Optional[str] = None, display_name: Optional[str] = None) -> Dict:
        try:
            update_fields = {}
            if email:
                update_fields['email'] = email
            if password:
                update_fields['password'] = password
            if display_name:
                update_fields['display_name'] = display_name
            
            user_record = auth.update_user(uid, **update_fields)
            
            return {
                "success": True,
                "user_id": user_record.uid,
                "email": user_record.email,
                "display_name": user_record.display_name,
            }
            
        except FirebaseError as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def delete_user(self, uid: str) -> Dict:
        try:
            auth.delete_user(uid)
            
            return {
                "success": True,
            }
            
        except FirebaseError as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def set_custom_claims(self, uid: str, custom_claims: Dict) -> Dict:
        try:
            auth.set_custom_user_claims(uid, custom_claims)
            
            return {
                "success": True,
            }
            
        except FirebaseError as e:
            return {
                "success": False,
                "error": str(e),
            }

firebase_auth_service = FirebaseAuthService()

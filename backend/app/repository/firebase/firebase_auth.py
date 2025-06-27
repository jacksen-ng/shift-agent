import os
import sys
from typing import Dict, Optional
import firebase_admin
from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError
import httpx

from ...secret_manager.secret_key import initialize_firebase, get_firebase_secret

class FirebaseAuthService:
    def __init__(self): 
        PROJECT_ID = "jacksen-server"
        SECRET_ID = "firebase-secret-credential"
        self.app = initialize_firebase(PROJECT_ID, SECRET_ID)
        
        FIREBASE_SECRET_ID = "firebase-key"
        self.firebase_secret = get_firebase_secret(PROJECT_ID, FIREBASE_SECRET_ID)
        
        
    def login_user(self, email: str, password: str) -> Dict:
        url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + self.firebase_secret
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }

        try:
            response = httpx.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return {
                "success": True,
                "firebase_uid": data.get("localId"),
                "email": data.get("email"),
                "id_token": data.get("idToken"),
                "refresh_token": data.get("refreshToken"),
                "expires_in": data.get("expiresIn"),

            }
        except httpx.HTTPStatusError as e:
            error_message = e.response.json().get("error", {}).get("message", str(e))
            return {
                "success": False,
                "error": error_message,
            }

    
    def create_user(self, email: str, password: str, role: str, display_name: Optional[str] = None) -> Dict:
        try:
            user_record = auth.create_user(
                email=email,
                password=password,
                email_verified=False
            )
            
            auth.set_custom_user_claims(user_record.uid, {"role": role})
            
            return {
                "success": True,
                "firebase_uid": user_record.uid,
                "email": email,
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
                "role": decoded_token.get('role'),
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
                "email_verified": user_record.email_verified,
                "custom_token": auth.create_custom_token(user_record.uid).decode('utf-8'),
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
            
            user_record = auth.update_user(uid, **update_fields)
            
            return {
                "success": True,
                "user_id": user_record.uid,
                "email": user_record.email,
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

    def refresh_id_token(self, refresh_token: str) -> Dict:
        url = "https://securetoken.googleapis.com/v1/token?key=" + self.firebase_secret
        payload = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token
        }

        try:
            response = httpx.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return {
                "success": True,
                "id_token": data.get("id_token"),
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in"),
            }
        except httpx.HTTPStatusError as e:
            error_message = e.response.json().get("error", {}).get("message", str(e))
            return {
                "success": False,
                "error": error_message,
            }
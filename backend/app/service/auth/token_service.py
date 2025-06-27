from fastapi import Request, Response
from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError

from app.repository.firebase.firebase_auth import FirebaseAuthService
from app.service.auth.save_cookie import save_auth_cookies

def verify_id_token(id_token: str, required_role: str = None) -> dict:
    try:
        decoded = auth.verify_id_token(id_token)

        user_info = {
            "uid": decoded["uid"],
            "email": decoded.get("email"),
            "role": decoded.get("role")
        }

        if required_role and user_info["role"] != required_role:
            raise Exception(f"RolePermissionError: {required_role}として認証されていません")

        return user_info  
    
    except FirebaseError as e:
        raise Exception("TokenExpiredError: access_tokenの有効期限切れ")

def verify_and_refresh_token(request: Request, response: Response, required_role: str = None) -> dict:
    id_token = request.cookies.get("id_token")
    refresh_token = request.cookies.get("refresh_token")
    
    if not id_token:
        raise Exception("AuthenticationError: ID tokenが見つかりません")
    
    try:
        return verify_id_token(id_token, required_role)
    
    except Exception as e:
        if "TokenExpiredError" in str(e) and refresh_token:
            firebase_service = FirebaseAuthService()
            refresh_result = firebase_service.refresh_id_token(refresh_token)
            
            if refresh_result["success"]:
                new_id_token = refresh_result["id_token"]
                new_refresh_token = refresh_result["refresh_token"]
                expires_in = int(refresh_result.get("expires_in", 3600))
                
                save_auth_cookies(response, new_id_token, new_refresh_token, expires_in)
                
                return verify_id_token(new_id_token, required_role)
            else:
                raise Exception("RefreshTokenError: リフレッシュトークンが無効です")
        
        raise e

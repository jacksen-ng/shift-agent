from fastapi import Request, Response, HTTPException
from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError

from ...repository.firebase.firebase_auth import FirebaseAuthService
from ...service.auth.save_cookie import save_auth_cookies

def verify_id_token(id_token: str, required_role: str = None) -> None:
    try:
        decoded = auth.verify_id_token(id_token)

        user_role = decoded.get("role") 

        if required_role and user_role != required_role:
            raise HTTPException(f"{required_role}として認証されていません")

        return None 
    
    except FirebaseError as e:
        if "token has expired" in str(e).lower():
            raise HTTPException("access_tokenの有効期限切れ")
        else:
            raise HTTPException(f"FirebaseVerificationError: {e}")


def verify_and_refresh_token(request: Request, response: Response, required_role: str = None) -> dict:
    id_token = request.cookies.get("id_token")
    refresh_token = request.cookies.get("refresh_token")
    
    if not id_token:
        raise HTTPException("ID tokenが見つかりません")
    
    try:
        verify_id_token(id_token, required_role) 
        
        return {
            "id_token": id_token,
            "refresh_token": refresh_token
        }
    
    except Exception as e:
        if "TokenExpiredError" in str(e) and refresh_token:
            firebase_service = FirebaseAuthService()
            refresh_result = firebase_service.refresh_id_token(refresh_token)
            
            if refresh_result["success"]:
                new_id_token = refresh_result["id_token"]
                new_refresh_token = refresh_result["refresh_token"]
                expires_in = int(refresh_result.get("expires_in", 3600))
                
                save_auth_cookies(response, new_id_token, new_refresh_token, expires_in)
                
                verify_id_token(new_id_token, required_role) 
                
                return {
                    "id_token": new_id_token,
                    "refresh_token": new_refresh_token
                }
            else:
                raise HTTPException("リフレッシュトークンが無効です")
        
        raise e
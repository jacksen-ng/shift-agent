from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError

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
        if "Token expired" in str(e):
            raise Exception("TokenExpiredError: access_tokenの有効期限切れ")

        raise Exception("InvalidTokenError: トークンが無効です")

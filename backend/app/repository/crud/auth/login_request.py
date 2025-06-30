from ...db.db_init import get_session_scope
from ...db.models.user import User

def login_request(firebase_uid: str):
    with get_session_scope() as session:
        user = session.query(User).filter(User.firebase_uid == firebase_uid).first()
        if user:
            return {
                "user_id": user.user_id,
                "company_id": user.company_id,
                "role": user.role
            }
        else:
            return {"error": "User not found"}
        
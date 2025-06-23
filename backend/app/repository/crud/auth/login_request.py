import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))

from repository.db.models import User
from repository.db.db_init import get_session_scope

def login_request(firebase_uid: str):
    with get_session_scope() as session:
        user = session.query(User).filter(User.firebase_uid == firebase_uid).first()
        if user:
            return {
                "user_id": user.user_id,
                "company_id": user.company_id,
            }
        else:
            return {"error": "User not found"}
        
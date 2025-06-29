from ...db.db_init import get_session_scope
from ...db.models import UserProfile

def crew_info_edit_request(
    user_id: int,
    name: str,
    age: str,
    phone: str,
    position: str,
    evaluate: int,
    experience: str,
    hour_pay: int,
    post: str
):
    with get_session_scope() as session:
        profile = session.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            return {"error": "UserProfile not found"}

        profile.name = name
        profile.age = age
        profile.phone = phone
        profile.position = position
        profile.evaluate = evaluate
        profile.experience = experience
        profile.hour_pay = hour_pay
        profile.post = post
        
        session.commit()

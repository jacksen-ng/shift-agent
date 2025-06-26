from ...db.db_init import get_session_scope
from ...db.models import UserProfile

def get_user_profiles_by_company(company_id: int):
    with get_session_scope() as session:
        profiles = (
            session.query(UserProfile)
            .filter(UserProfile.company_id == company_id)
            .order_by(UserProfile.user_id)
            .all()
        )

        return [
            {
                "user_id": p.user_id,
                "name": p.name,
                "age": p.age,
                "phone": p.phone,
                "position": p.position,
                "evaluate": p.evaluate,
                "join_company_day": p.join_company_day.isoformat() if p.join_company_day else None,
                "hour_pay": p.hour_pay,
                "post": p.post
            }
            for p in profiles
        ]

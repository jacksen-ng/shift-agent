from ...db.db_init import get_session_scope
from ...db.models import User, UserProfile, DecisionShift, CompanyRestDay

def decision_shift_request(company_id: int):
    with get_session_scope() as session:
        shift_results = (
            session.query(
                DecisionShift.day,
                DecisionShift.start_time,
                DecisionShift.finish_time,
                UserProfile.name,
                UserProfile.position,
                UserProfile.post
            )
            .join(User, User.user_id == DecisionShift.user_id)
            .outerjoin(UserProfile, UserProfile.user_id == User.user_id)
            .filter(User.company_id == company_id)
            .order_by(DecisionShift.day, DecisionShift.start_time)
            .all()
        )

        shifts = [
            {
                "name": r.name,
                "position": r.position,
                "day": r.day.isoformat() if r.day else None,
                "post": r.post,
                "start_time": r.start_time.strftime("%H:%M:%S") if r.start_time else None,
                "finish_time": r.finish_time.strftime("%H:%M:%S") if r.finish_time else None
            }
            for r in shift_results
        ]

        rest_day_results = (
            session.query(CompanyRestDay.rest_day)
            .filter(CompanyRestDay.company_id == company_id)
            .order_by(CompanyRestDay.rest_day)
            .all()
        )

        rest_days = [
            {"rest_day": r.rest_day.isoformat()} for r in rest_day_results
        ]

        return {
            "decision_shift": shifts,
            "rest_day": rest_days
        }

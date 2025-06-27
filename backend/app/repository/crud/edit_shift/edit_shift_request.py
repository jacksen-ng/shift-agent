from ...db.db_init import get_session_scope
from ...db.models import EditShift, UserProfile

def edit_shift_request(company_id: int):
    with get_session_scope() as session:
        shift_results = (
            session.query(
                EditShift.edit_shift_id,
                EditShift.user_id,
                EditShift.day,
                EditShift.start_time,
                EditShift.finish_time
            )
            .filter(EditShift.company_id == company_id)
            .order_by(EditShift.day, EditShift.start_time)
            .all()
        )

        edit_shifts = [
            {
                "edit_shift_id": r.edit_shift_id,
                "user_id": r.user_id,
                "day": r.day.isoformat() if r.day else None,
                "start_time": r.start_time.strftime("%H:%M:%S") if r.start_time else None,
                "finish_time": r.finish_time.strftime("%H:%M:%S") if r.finish_time else None
            }
            for r in shift_results
        ]

        user_results = (
            session.query(UserProfile.user_id, UserProfile.name)
            .filter(UserProfile.company_id == company_id)
            .all()
        )

        company_member_name = [
            {
                "user_id": u.user_id,
                "name": u.name
            }
            for u in user_results
        ]

        return {
            "edit_shift": edit_shifts,
            "company_member_name": company_member_name
        }

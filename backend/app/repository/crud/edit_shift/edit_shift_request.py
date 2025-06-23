import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))
from repository.db.db_init import get_session_scope
from repository.db.models import EditShift, UserProfile
from datetime import datetime

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

        shifts = [
            {
                "edit_shift_id": r.edit_shift_id,
                "user_id": r.user_id,
                "day": r.day.isoformat(),
                "start_time": r.start_time.strftime("%H:%M"),
                "finish_time": r.finish_time.strftime("%H:%M")
            }
            for r in shift_results
        ]

        user_results = (
            session.query(UserProfile.user_id, UserProfile.name)
            .filter(UserProfile.company_id == company_id)
            .all()
        )

        users = [
            {
                "user_id": u.user_id,
                "name": u.name
            }
            for u in user_results
        ]

        return {
            "shifts": shifts,
            "users": users
        }

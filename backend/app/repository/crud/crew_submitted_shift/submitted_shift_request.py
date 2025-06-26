from datetime import datetime
from ...db.db_init import get_session_scope
from ...db.models import SubmittedShift, EditShift

def submit_shift_request(shifts: list[dict]):
    with get_session_scope() as session:
        for shift in shifts:
            day = datetime.strptime(shift["day"], "%Y-%m-%d").date()
            start_time = datetime.strptime(shift["start_time"], "%H:%M").time()
            finish_time = datetime.strptime(shift["finish_time"], "%H:%M").time()

            submitted_shift = SubmittedShift(
                user_id=shift["user_id"],
                company_id=shift["company_id"],
                day=day,
                start_time=start_time,
                finish_time=finish_time
            )
            session.add(submitted_shift)

            edit_shift = EditShift(
                user_id=shift["user_id"],
                company_id=shift["company_id"],
                day=day,
                start_time=start_time,
                finish_time=finish_time
            )
            session.add(edit_shift)

        return {"message": "Shift submitted successfully"}

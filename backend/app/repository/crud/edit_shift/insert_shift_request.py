from ...db.db_init import get_session_scope
from ...db.models import EditShift
from datetime import datetime

def insert_future_shifts(new_shifts: list[dict]):
    today = datetime.today().date()
    inserted_count = 0

    with get_session_scope() as session:
        for shift in new_shifts:
            shift_day = datetime.strptime(shift["day"], "%Y-%m-%d").date()
            if shift_day >= today:
                shift_obj = EditShift(
                    user_id=shift["user_id"],
                    company_id=shift["company_id"],
                    day=shift_day,
                    start_time=datetime.strptime(shift["start_time"], "%H:%M").time(),
                    finish_time=datetime.strptime(shift["finish_time"], "%H:%M").time()
                )
                session.add(shift_obj)
                inserted_count += 1

        return {"message": f"{inserted_count} future shifts inserted"}

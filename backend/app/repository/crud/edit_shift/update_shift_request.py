from ...db.db_init import get_session_scope
from ...db.models import EditShift
from datetime import datetime

def update_shift_request(shift_updates: list[dict]):
    with get_session_scope() as session:
        for shift in shift_updates:
            shift_obj = session.query(EditShift).filter(EditShift.edit_shift_id == shift["edit_shift_id"]).first()
            if shift_obj:
                shift_obj.start_time = datetime.strptime(shift["start_time"], "%H:%M:%S").time()
                shift_obj.finish_time = datetime.strptime(shift["finish_time"], "%H:%M:%S").time()
        session.commit()

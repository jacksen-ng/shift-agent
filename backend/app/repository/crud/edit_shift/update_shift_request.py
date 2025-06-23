import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))
from repository.db.db_init import get_session_scope
from repository.db.models import EditShift
from datetime import datetime

def update_shifts(shift_updates: list[dict]):
    with get_session_scope() as session:
        for shift in shift_updates:
            shift_obj = session.query(EditShift).filter(EditShift.edit_shift_id == shift["edit_shift_id"]).first()
            if shift_obj:
                shift_obj.start_time = datetime.strptime(shift["start_time"], "%H:%M").time()
                shift_obj.finish_time = datetime.strptime(shift["finish_time"], "%H:%M").time()
        return {"message": f"{len(shift_updates)} shifts updated"}

from ...db.db_init import get_session_scope
from ...db.models import EditShift

def delete_shifts_by_ids(edit_shift_ids: list[int]):
    with get_session_scope() as session:
        session.query(EditShift).filter(EditShift.edit_shift_id.in_(edit_shift_ids)).delete(synchronize_session=False)
        return {"message": f"{len(edit_shift_ids)} shifts deleted"}

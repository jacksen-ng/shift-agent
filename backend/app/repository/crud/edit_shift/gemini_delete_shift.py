from datetime import date
from ...db.db_init import get_session_scope
from ...db.models import EditShift

def gemini_delete_shift(company_id: int, first_day: date, last_day: date):
    with get_session_scope() as session:
        session.query(EditShift).filter(
            EditShift.company_id == company_id,
            EditShift.day >= first_day,
            EditShift.day <= last_day
        ).delete(synchronize_session=False)


from datetime import datetime
from ...db.db_init import get_session_scope
from ...db.models import EditShift

def gemini_delete_shift(company_id: int, first_day: str, last_day: str):
    with get_session_scope() as session:
        session.query(EditShift).filter(
            EditShift.company_id == company_id,
            EditShift.day >= datetime.strptime(first_day, '%Y-%m-%d').date(),
            EditShift.day <= datetime.strptime(last_day, '%Y-%m-%d').date()
        ).delete(synchronize_session=False)


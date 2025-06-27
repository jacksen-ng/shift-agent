from datetime import date, timedelta
from ...db.db_init import get_session_scope
from ...db.models import EditShift

def gemini_delete_shift(company_id: int, year: int, month: int):
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)

    with get_session_scope() as session:
        session.query(EditShift).filter(
            EditShift.company_id == company_id,
            EditShift.day >= first_day,
            EditShift.day <= last_day
        ).delete(synchronize_session=False)

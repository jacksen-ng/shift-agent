from ...db.db_init import get_session_scope
from ...db.models import EditShift, DecisionShift
from datetime import date
from sqlalchemy import and_, exists

def complete_edit_shift_request(company_id: int):
    today = date.today()
    inserted_count = 0

    with get_session_scope() as session:
        future_shifts = session.query(
            EditShift.user_id,
            EditShift.day,
            EditShift.start_time,
            EditShift.finish_time
        ).filter(
            and_(
                EditShift.company_id == company_id,
                EditShift.day > today
            )
        ).all()

        for shift in future_shifts:
            exists_query = session.query(
                exists().where(
                    and_(
                        DecisionShift.user_id == shift.user_id,
                        DecisionShift.company_id == company_id,
                        DecisionShift.day == shift.day,
                        DecisionShift.start_time == shift.start_time,
                        DecisionShift.finish_time == shift.finish_time
                    )
                )
            ).scalar()

            if not exists_query:
                new_decision = DecisionShift(
                    user_id=shift.user_id,
                    company_id=company_id,
                    day=shift.day,
                    start_time=shift.start_time,
                    finish_time=shift.finish_time
                )
                session.add(new_decision)
                inserted_count += 1
                
        session.commit()

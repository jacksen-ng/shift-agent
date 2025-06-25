import os
import sys
from datetime import date
from typing import Dict, List, Optional

sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))

from repository.db.db_init import get_session_scope
from repository.db.models import Company, CompanyRestDay, UserProfile, SubmittedShift
from sqlalchemy import func


SubmittedShiftData = Dict[str, str]  


def gemini_create_shift(
    company_id: int,
    first_day: date,
    last_day: date,
    new_shift_data: Optional[List[SubmittedShiftData]] = None
) -> Dict[str, List[dict]]:

    with get_session_scope() as session:
        session.query(SubmittedShift).filter(
            SubmittedShift.company_id == company_id,
            SubmittedShift.day >= first_day,
            SubmittedShift.day <= last_day
        ).delete(synchronize_session=False)

        if new_shift_data:
            for shift in new_shift_data:
                new_shift = SubmittedShift(
                    user_id=shift["user_id"],
                    company_id=shift["company_id"],
                    day=shift["day"],
                    start_time=shift["start_time"],
                    finish_time=shift["finish_time"]
                )
                session.add(new_shift)

        company_data = session.query(Company).filter(Company.company_id == company_id).first()
        company_info = {
            "open_time": company_data.open_time,
            "close_time": company_data.close_time,
            "target_sales": company_data.target_sales,
            "labor_cost": company_data.labor_cost
        } if company_data else {}

        rest_days = session.query(CompanyRestDay.rest_day).filter(
            CompanyRestDay.company_id == company_id,
            CompanyRestDay.rest_day >= first_day,
            CompanyRestDay.rest_day <= last_day
        ).all()
        rest_days_list = [rd.rest_day for rd in rest_days]

        user_profiles = session.query(
            UserProfile.user_id,
            UserProfile.name,
            UserProfile.position,
            UserProfile.evaluate,
            UserProfile.experience,
            UserProfile.hour_pay,
            UserProfile.post
        ).filter(UserProfile.company_id == company_id).all()
        users_list = [dict(row._asdict()) for row in user_profiles]

        submitted_shifts = session.query(
            SubmittedShift.submitted_shift_id,
            SubmittedShift.user_id,
            SubmittedShift.day,
            SubmittedShift.start_time,
            SubmittedShift.finish_time
        ).filter(
            SubmittedShift.company_id == company_id,
            SubmittedShift.day >= first_day,
            SubmittedShift.day <= last_day
        ).all()
        shifts_list = [dict(row._asdict()) for row in submitted_shifts]

        return {
            "first_day": first_day,
            "last_day": last_day,
            "company": company_info,
            "rest_days": rest_days_list,
            "users": users_list,
            "submitted_shifts": shifts_list
        }

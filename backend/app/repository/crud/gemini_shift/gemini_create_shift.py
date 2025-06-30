from datetime import datetime
from typing import Dict, List, Optional
from ...db.db_init import get_session_scope
from ...db.models import Company, CompanyRestDay, UserProfile, SubmittedShift

def gemini_create_shift(
    company_id: int,
    first_day: str,
    last_day: str,
) -> Dict:

    with get_session_scope() as session:
        # 1. company_info + rest_day
        company_data = session.query(Company).filter(Company.company_id == company_id).first()
        rest_days = session.query(CompanyRestDay.rest_day).filter(
            CompanyRestDay.company_id == company_id,
            CompanyRestDay.rest_day >= datetime.strptime(first_day, '%Y-%m-%d').date(),
            CompanyRestDay.rest_day <= datetime.strptime(last_day, '%Y-%m-%d').date()
        ).all()

        company_info = {
            "company_id": company_data.company_id,
            "open_time": company_data.open_time,
            "close_time": company_data.close_time,
            "rest_day": [rd.rest_day.isoformat() for rd in rest_days],
            "labor_cost": company_data.labor_cost,
            "comment": company_data.comment
        } if company_data else {}

        # 2. get all shifts
        all_shifts = session.query(
            SubmittedShift.submitted_shift_id,
            SubmittedShift.user_id,
            SubmittedShift.day,
            SubmittedShift.start_time,
            SubmittedShift.finish_time
        ).filter(
            SubmittedShift.company_id == company_id,
            SubmittedShift.day >= datetime.strptime(first_day, '%Y-%m-%d').date(),
            SubmittedShift.day <= datetime.strptime(last_day, '%Y-%m-%d').date()
        ).all()

        # build user_id -> [shifts] map
        shift_map = {}
        for shift in all_shifts:
            shift_data = {
                "edit_shift_id": shift.submitted_shift_id,
                "day": shift.day.isoformat(),
                "start_time": shift.start_time.strftime("%H:%M:%S"),
                "finish_time": shift.finish_time.strftime("%H:%M:%S")
            }
            shift_map.setdefault(shift.user_id, []).append(shift_data)

        # 3. user_profiles with embedded shifts
        user_profiles = session.query(
            UserProfile.user_id,
            UserProfile.name,
            UserProfile.evaluate,
            UserProfile.position,
            UserProfile.experience,
            UserProfile.hour_pay
        ).filter(UserProfile.company_id == company_id).all()

        company_member = [
            {
                "user_id": p.user_id,
                "name": p.name,
                "evaluate": p.evaluate,
                "position": p.position,
                "experience": p.experience,
                "hour_pay": p.hour_pay,
                "submitted_shift": shift_map.get(p.user_id, [])
            }
            for p in user_profiles
        ]

        return {
            "company_info": company_info,
            "company_member": company_member
        }

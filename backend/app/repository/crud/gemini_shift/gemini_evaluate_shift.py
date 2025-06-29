from datetime import date
from typing import Dict, List
from ...db.db_init import get_session_scope
from ...db.models import Company, CompanyRestDay, UserProfile, EditShift, DecisionShift, EvaluateDecisionShift

def gemini_evaluate_shift(company_id: int, first_day: date, last_day: date) -> Dict:

    with get_session_scope() as session:
        # 1. company info
        company = session.query(Company).filter(Company.company_id == company_id).first()

        rest_days = session.query(CompanyRestDay.rest_day).filter(
            CompanyRestDay.company_id == company_id,
            CompanyRestDay.rest_day >= first_day,
            CompanyRestDay.rest_day <= last_day
        ).all()

        company_info = {
            "company_id": company.company_id,
            "open_time": company.open_time,
            "close_time": company.close_time,
            "rest_day": [r.rest_day.isoformat() for r in rest_days],
            "labor_cost": company.labor_cost,
            "comment": company.comment
        } if company else {}

        # 2. all edit shifts (by user)
        edit_shifts = session.query(
            EditShift.edit_shift_id,
            EditShift.user_id,
            EditShift.day,
            EditShift.start_time,
            EditShift.finish_time
        ).filter(
            EditShift.company_id == company_id,
            EditShift.day >= first_day,
            EditShift.day <= last_day
        ).all()

        edit_shift_map = {}
        for shift in edit_shifts:
            shift_data = {
                "edit_shift_id": shift.edit_shift_id,
                "day": shift.day.isoformat(),
                "start_time": shift.start_time.strftime("%H:%M:%S"),
                "finish_time": shift.finish_time.strftime("%H:%M:%S")
            }
            edit_shift_map.setdefault(shift.user_id, []).append(shift_data)

        # 3. user profile with embed edit_shift
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
                "edit_shift": edit_shift_map.get(p.user_id, [])
            }
            for p in user_profiles
        ]

        # 4. decision shift
        decision_shifts = session.query(
            DecisionShift.user_id,
            DecisionShift.day,
            DecisionShift.start_time,
            DecisionShift.finish_time  # fix field name
        ).filter(DecisionShift.company_id == company_id).all()

        decision_shift_list = [
            {
                "user_id": d.user_id,
                "day": d.day.isoformat(),
                "start_time": d.start_time.strftime("%H:%M:%S"),
                "finish_time": d.finish_time.strftime("%H:%M:%S")
            }
            for d in decision_shifts
        ]

        # 5. evaluate_decision_shift
        evaluate_decisions = session.query(
            EvaluateDecisionShift.start_day,
            EvaluateDecisionShift.finish_day,
            EvaluateDecisionShift.evaluate
        ).filter(EvaluateDecisionShift.company_id == company_id).all()

        evaluate_decision_list = [
            {
                "start_day": e.start_day.isoformat(),
                "finish_day": e.finish_day.isoformat(),
                "evaluate": e.evaluate
            }
            for e in evaluate_decisions
        ]

        return {
            "company_info": company_info,
            "company_member": company_member,
            "evaluate_decision_shift": {
                "decision_shift": decision_shift_list,
                "evaluate_decision_shift": evaluate_decision_list
            }
        }

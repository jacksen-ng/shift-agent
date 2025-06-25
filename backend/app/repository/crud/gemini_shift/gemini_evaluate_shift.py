import os
import sys
from datetime import date
from typing import Dict, List

sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))

from repository.db.db_init import get_session_scope
from repository.db.models import Company, CompanyRestDay, UserProfile, EditShift, DecisionShift, EvaluateDecisionShift

def gemini_evaluate_shift(company_id: int, first_day: date, last_day: date) -> Dict[str, List[dict]]:
    with get_session_scope() as session:
        company = session.query(Company).filter(Company.company_id == company_id).first()
        company_info = {
            "open_time": company.open_time,
            "close_time": company.close_time,
            "target_sales": company.target_sales,
            "labor_cost": company.labor_cost
        } if company else {}

        rest_days = session.query(CompanyRestDay.rest_day).filter(
            CompanyRestDay.company_id == company_id,
            CompanyRestDay.rest_day >= first_day,
            CompanyRestDay.rest_day <= last_day
        ).all()
        rest_days_list = [r.rest_day for r in rest_days]

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
        edit_shifts_list = [dict(row._asdict()) for row in edit_shifts]

        decision_shifts = session.query(
            DecisionShift.user_id,
            DecisionShift.day,
            DecisionShift.start_time,
            DecisionShift.last_time
        ).filter(DecisionShift.company_id == company_id).all()
        decision_shifts_list = [dict(row._asdict()) for row in decision_shifts]

        evaluate_decisions = session.query(
            EvaluateDecisionShift.start_day,
            EvaluateDecisionShift.finish_day,
            EvaluateDecisionShift.evaluate
        ).filter(EvaluateDecisionShift.company_id == company_id).all()
        evaluate_decisions_list = [dict(row._asdict()) for row in evaluate_decisions]

        return {
            "company": company_info,
            "rest_days": rest_days_list,
            "users": users_list,
            "edit_shifts": edit_shifts_list,
            "decision_shifts": decision_shifts_list,
            "evaluate_decision_shifts": evaluate_decisions_list
        }

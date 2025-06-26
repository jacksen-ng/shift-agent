from ...db.db_init import get_session_scope
from ...db.models import Company, CompanyRestDay, CompanyPosition
from sqlalchemy.orm import aliased
from sqlalchemy import and_

def company_info_request(company_id:int):
    with get_session_scope() as session:
        rest_alias = aliased(CompanyRestDay)
        position_alias = aliased(CompanyPosition)
        
        rows = (
            session.query(
                Company.company_id,
                Company.company_name,
                Company.store_locate,
                Company.open_time,
                Company.close_time,
                Company.target_sales,
                Company.labor_cost,
                rest_alias.rest_day,
                position_alias.position_name,
            )
            .outerjoin(rest_alias, Company.company_id == rest_alias.company_id)
            .outerjoin(position_alias, Company.company_id == position_alias.company_id)
            .filter(Company.company_id == company_id)
            .all()
        )
        
        if not rows:
            return {"error": "Company not found"}
        
        company_data = rows[0]

        rest_days = set()
        position_names = set()
        for r in rows:
            if r.rest_day:
                rest_days.add(r.rest_day.isoformat())
            if r.position_name:
                position_names.add(r.position_name)

        return {
            "company_name": company_data.company_name,
            "store_locate": company_data.store_locate,
            "open_time": company_data.open_time.strftime("%H:%M") if company_data.open_time else None,
            "close_time": company_data.close_time.strftime("%H:%M") if company_data.close_time else None,
            "target_sales": company_data.target_sales,
            "labor_cost": company_data.labor_cost,
            "rest_days": list(rest_days),
            "position_names": list(position_names)
        }
        
from datetime import datetime
from ...db.db_init import get_session_scope
from ...db.models import Company, CompanyRestDay, CompanyPosition

def company_info_edit_request(
    company_id: int,
    company_name: str,
    store_locate: str,
    open_time: str,
    close_time: str,
    target_sales: int,
    labor_cost: int,
    new_rest_days: list[str],
    new_position_names: list[str]
):
    today = datetime.today().date()

    with get_session_scope() as session:
        company = session.query(Company).filter(Company.company_id == company_id).first()
        if not company:
            return {"error": "Company not found"}

        company.company_name = company_name
        company.store_locate = store_locate
        company.open_time = datetime.strptime(open_time, "%H:%M").time()
        company.close_time = datetime.strptime(close_time, "%H:%M").time()
        company.target_sales = target_sales
        company.labor_cost = labor_cost

        session.query(CompanyRestDay) \
            .filter(
                CompanyRestDay.company_id == company_id,
                CompanyRestDay.rest_day >= today
            ) \
            .delete(synchronize_session=False)

        for day in new_rest_days:
            rest_day = CompanyRestDay(
                company_id=company_id,
                rest_day=datetime.strptime(day, "%Y-%m-%d").date()
            )
            session.add(rest_day)

        session.query(CompanyPosition) \
            .filter(CompanyPosition.company_id == company_id) \
            .delete(synchronize_session=False)

        for name in new_position_names:
            position = CompanyPosition(
                company_id=company_id,
                position_name=name
            )
            session.add(position)
            
        session.commit()

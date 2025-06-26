import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))

from repository.db.db_init import get_session_scope
from repository.db.models import Company, User, UserProfile
from datetime import datetime, date

def signin_request_owner(firebase_uid: str, email: str, role: str,
                        company_name: str = None, 
                        store_locate: str = None, 
                        open_time: str = None, 
                        close_time: str = None, 
                        target_sales: int = None, 
                        labor_cost: int = None,
                        name: str = None,
                        age: str = None,
                        phone: str = None,
                        position: str = None,
                        evaluate: int = None,
                        join_company_day: datetime = None,
                        hour_pay: int = None,
                        post: str = None):
    
    with get_session_scope() as session:
        company = Company(
            company_name=company_name or None,
            store_locate=store_locate or None,
            open_time=open_time or None,
            close_time=close_time or None,
            target_sales=target_sales or None,
            labor_cost=labor_cost or None,
        )
        session.add(company)
        session.flush()
        
        user = User(
            company_id=company.company_id,
            email=email,
            firebase_uid=firebase_uid,
            role=role
        )
        session.add(user)
        session.flush()
        
        user_profile = UserProfile(
            user_id=user.user_id,
            company_id=company.company_id,
            name=name or None,
            age=age or None,
            phone=phone or None,
            position=position or None,
            evaluate=evaluate or None,
            join_company_day=join_company_day or datetime.now(),
            hour_pay=hour_pay or None,
            post=post or None,
        )
        session.add(user_profile)
        session.commit()


def signin_request_crew(firebase_uid: str, email: str, role: str,
                        company_id: int = None, 
                        name: str = None,
                        age: str = None,
                        phone: str = None,
                        position: str = None,
                        evaluate: int = None,
                        join_company_day: str = None,
                        hour_pay: int = None,
                        post: str = None):
    with get_session_scope() as session:
        user = User(
            company_id=company_id,
            email=email,
            firebase_uid=firebase_uid,
            role=role
        )
        session.add(user)
        session.flush()
        
        user_profile = UserProfile(
            user_id=user.user_id,
            company_id=company_id,
            name=name or None,
            age=age or None,
            phone=phone or None,
            position=position or None,
            evaluate=evaluate or None,
            join_company_day=join_company_day or datetime.now(),
            hour_pay=hour_pay or None,
            post=post or None
        )
        session.add(user_profile)
        session.commit()
        
        
        
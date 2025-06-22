import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))

from repository.db.db_init import get_session_scope
from repository.db.models import Company, User, UserProfile

def signin_request_owner(company_name: str, 
                        store_locate:str, 
                        open_time:str, 
                        close_time:str, 
                        target_sales:int, 
                        labor_cost:int,
                        user_id:int,
                        company_id:int,
                        name:str,
                        age:str,
                        phone:str,
                        position_name:str,
                        evaluate:int,
                        join_company_day:str,
                        hour_pay:int,
                        post:str,
                        firebase_uid:str,
                        email:str,
                        role:str):
    
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
            position_name=position_name or None,
            evaluate=evaluate or None,
            join_company_day=join_company_day,
            hour_pay=hour_pay or None,
            post=post or None,
        )
        session.add(user_profile)
        
        return {
            "company_id": company.company_id,
            "user_id": user.user_id,
        }

def signin_request_crew(company_id:int, 
                        name:str,
                        age:str,
                        phone:str,
                        position:str,
                        evaluate:int,
                        join_company_day:str,
                        hour_pay:int,
                        post:str,
                        firebase_uid:str,
                        email:str,
                        role:str):
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
            join_company_day=join_company_day or None,
            hour_pay=hour_pay or None,
            post=post or None
        )
        session.add(user_profile)

        return {
            "user_id": user.user_id
        }
        
        
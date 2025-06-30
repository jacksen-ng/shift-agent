from sqlalchemy import Column, Integer, ForeignKey, Text, Date
from .base import Base
from datetime import date

class UserProfile(Base):
    __tablename__ = "user_profile"
    user_profile_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    company_id = Column(Integer, ForeignKey("company.company_id"))
    name = Column(Text)
    age = Column(Integer)
    phone = Column(Text)
    position = Column(Text)
    evaluate = Column(Text)
    experience = Column(Text)
    hour_pay = Column(Integer)
    post = Column(Text)
    join_company_day = Column(Date)
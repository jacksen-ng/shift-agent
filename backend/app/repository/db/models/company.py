from sqlalchemy import Column, Integer, Text, CheckConstraint, Time
from .base import Base

class Company(Base):
    __tablename__ = "company"
    company_id = Column(Integer, primary_key=True)
    company_name = Column(Text)
    store_locate = Column(Text)
    open_time = Column(Time)
    close_time = Column(Time)
    target_sales = Column(Integer)
    laber_cost = Column(Integer)
from sqlalchemy import Column, Integer, ForeignKey, Date
from .base import Base

class CompanyRestDay(Base):
    __tablename__ = "company_rest_day"
    company_rest_day_id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("company.company_id"))
    rest_day = Column(Date)

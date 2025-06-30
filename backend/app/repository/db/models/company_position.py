from sqlalchemy import Column, Integer, ForeignKey, Text
from .base import Base

class CompanyPosition(Base):
    __tablename__ = "company_position"
    company_position_id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("company.company_id"))
    position_name = Column(Text)
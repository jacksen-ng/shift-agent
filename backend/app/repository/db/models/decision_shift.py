from sqlalchemy import Column, Integer, ForeignKey, Date, Time
from .base import Base

class DecisionShift(Base):
    __tablename__ = "decision_shift"
    decision_shift_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    company_id = Column(Integer, ForeignKey("company.company_id"))
    day = Column(Date)
    start_time = Column(Time)
    finish_time = Column(Time)
from sqlalchemy import Column, Integer, ForeignKey, Date, Time
from .base import Base

class EditShift(Base):
    __tablename__ = "edit_shift"
    edit_shift_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    company_id = Column(Integer, ForeignKey("company.company_id"))
    day = Column(Date)
    start_time = Column(Time)
    finish_time = Column(Time)
from sqlalchemy import Column, Integer, CheckConstraint, Date, Text
from .base import Base

class EvaluateDecisionShift(Base):
    __tablename__ = "evaluate_decision_shift"
    evaluate_decision_shift_id = Column(Integer, primary_key=True)
    start_day = Column(Date)
    finish_day = Column(Date)
    evaluate = Column(Text)

    __table_args__ = (
        CheckConstraint(evaluate.in_(["1", "2", "3", "4", "5"]), name="check_evaluate"),
    )
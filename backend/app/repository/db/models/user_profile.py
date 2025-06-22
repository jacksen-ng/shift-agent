from sqlalchemy import Column, Integer, CheckConstraint, ForeignKey, Text
from .base import Base

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

    __table_args__ = (
        CheckConstraint(phone.like("%-%"), name="check_phone"),
        CheckConstraint(evaluate.in_(["1", "2", "3", "4", "5"]), name="check_evaluate"),
        CheckConstraint(experience.in_(["beginner", "veteran"]), name="check_experience"),
        CheckConstraint(post.in_(["part_timer", "employee"]), name="check_post"),
    )
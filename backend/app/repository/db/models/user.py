from sqlalchemy import Column, Integer, CheckConstraint, ForeignKey, Text
from .base import Base

class User(Base):
    __tablename__ = "user"
    user_id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("company.company_id"))
    email = Column(Text, unique=True)
    firebase_uid = Column(Text, unique=True)
    role = Column(Text)

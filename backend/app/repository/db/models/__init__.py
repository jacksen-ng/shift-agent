import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from db_init import get_db_connection
from .base import Base
from .company_position import CompanyPosition
from .company_rest_day import CompanyRestDay
from .company import Company
from .decision_shift import DecisionShift
from .edit_shift import EditShift
from .evaluate_decision_shift import EvaluateDecisionShift
from .submitted_shift import SubmittedShift
from .user import User
from .user_profile import UserProfile

tables = [
    Company,
    CompanyRestDay,
    CompanyPosition,
    DecisionShift,
    EditShift,
    SubmittedShift,
    EvaluateDecisionShift,
    User,
    UserProfile,
]


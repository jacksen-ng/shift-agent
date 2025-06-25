import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from user_profile.user_profile_id import UserProfileIDValidation
from user_profile.user_id import UserIDValidation
from user_profile.company_id import CompanyIDValidation
from user_profile.name import NameValidation
from user_profile.age import AgeValidation
from user_profile.phone import PhoneValidation
from user_profile.position import PositionValidation
from user_profile.evaluate import EvaluateValidation
from user_profile.experience import ExperienceValidation
from user_profile.hour_pay import HourPayValidation
from user_profile.post import PostValidation
from user_profile.join_company_day import JoinCompanyDayValidation

user_profile_validation = {
    'UserProfileIDValidation': UserProfileIDValidation,
    'UserIDValidation': UserIDValidation,
    'CompanyIDValidation': CompanyIDValidation,
    'NameValidation': NameValidation,
    'AgeValidation': AgeValidation,
    'PhoneValidation': PhoneValidation,
    'PositionValidation': PositionValidation,
    'EvaluateValidation': EvaluateValidation,
    'ExperienceValidation': ExperienceValidation,
    'HourPayValidation': HourPayValidation,
    'PostValidation': PostValidation,
    'JoinCompanyDayValidation': JoinCompanyDayValidation
}
from .user_profile_id import UserProfileIDValidation
from .user_id import UserIDValidation
from .company_id import CompanyIDValidation
from .name import NameValidation
from .age import AgeValidation
from .phone import PhoneValidation
from .position import PositionValidation
from .evaluate import EvaluateValidation
from .experience import ExperienceValidation
from .hour_pay import HourPayValidation
from .post import PostValidation
from .join_company_day import JoinCompanyDayValidation

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
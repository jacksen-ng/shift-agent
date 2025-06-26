from .user_id import UserIDValidation
from .company_id import CompanyIDValidation
from .firebase_uid import FirebaseUIDValidation
from .email import EmailValidation
from .role import RoleValidation

user_validation = {
    'UserIDValidation': UserIDValidation,
    'CompanyIDValidation': CompanyIDValidation,
    'FirebaseUIDValidation': FirebaseUIDValidation,
    'EmailValidation': EmailValidation,
    'RoleValidation': RoleValidation
}
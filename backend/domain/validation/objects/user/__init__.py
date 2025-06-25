import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from user.user_id import UserIDValidation
from user.company_id import CompanyIDValidation
from user.auth0_id import Auth0IDValidation
from user.email import EmailValidation
from user.role import RoleValidation

user_validation = {
    'UserIDValidation': UserIDValidation,
    'CompanyIDValidation': CompanyIDValidation,
    'Auth0IDValidation': Auth0IDValidation,
    'EmailValidation': EmailValidation,
    'RoleValidation': RoleValidation
}
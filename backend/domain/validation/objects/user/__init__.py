import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from user.user_id import UserID
from user.company_id import CompanyID
from user.auth0_id import Auth0ID
from user.email import Email
from user.role import Role

UserModels = {
    'UserID': UserID,
    'CompanyID': CompanyID,
    'Auth0ID': Auth0ID,
    'Email': Email,
    'Role': Role
}
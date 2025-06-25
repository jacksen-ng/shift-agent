import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from .login_request import login_request
from .signin_request import signin_request

auth_repository = {
    "login_request": login_request,
    "signin_request": signin_request
}


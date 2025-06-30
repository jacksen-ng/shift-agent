from .login_request import login_request
from .signin_request import signin_request_owner, signin_request_crew

auth_repository = {
    "login_request": login_request,
    "signin_request_owner": signin_request_owner,
    "signin_request_crew": signin_request_crew
}
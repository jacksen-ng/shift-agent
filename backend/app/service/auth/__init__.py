from .save_cookie import save_auth_cookies
from .token_service import verify_and_refresh_token

auth_services = {
    'save_auth_cookies': save_auth_cookies,
    'verify_and_refresh_token': verify_and_refresh_token
}
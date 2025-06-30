from fastapi import Response

def save_id_token_cookie(response: Response, id_token: str, max_age: int = 3600):
    response.set_cookie(
        key="id_token",
        value=id_token,
        httponly=True,
        secure=True,
        samesite="None",
        max_age=max_age
    )

def save_refresh_token_cookie(response: Response, refresh_token: str, max_age: int = 2592000):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="None",
        max_age=max_age
    )

def save_auth_cookies(response: Response, id_token: str, refresh_token: str, id_token_max_age: int = 3600, refresh_token_max_age: int = 2592000):
    save_id_token_cookie(response, id_token, id_token_max_age)
    save_refresh_token_cookie(response, refresh_token, refresh_token_max_age)
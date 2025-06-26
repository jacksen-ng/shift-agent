from fastapi import Response

def save_id_token_cookie(response: Response, id_token: str, max_age: int = 3600):
    response.set_cookie(
        key="id_token",
        value=id_token,
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=max_age
    )
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse

from ..app.usecase.auth import auth_usecase

app = APIRouter()

@app.post('/login')
def post_login(email, password, response: Response):
    try:
        response_values = auth_usecase['LoginUsecase'](email, password).execute(response)
        return response_values
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/signin')
def post_signin(email, password, confirm_password, role):
    try:
        response_values = auth_usecase['SigninUsecase'](email, password, confirm_password, role).execute()
        return response_values
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
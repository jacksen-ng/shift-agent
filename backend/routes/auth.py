from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse

from ..app.usecase.auth import auth_usecase

app = APIRouter()

@app.post('/login')
def post_login(request_body, response: Response):
    try:
        response_values = auth_usecase['LoginUsecase'](request_body['email'], request_body['password']).execute(response)
        return response_values
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/signin')
def post_signin(request_body):
    try:
        response_values = auth_usecase['SigninUsecase'](request_body['email'], request_body['password'], request_body['confirm_password'], request_body['role']).execute()
        return response_values
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
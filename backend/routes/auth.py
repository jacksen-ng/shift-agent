from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..app.usecase.auth import auth_usecase

app = APIRouter()

@app.post('/login')
async def post_login(request: Request, response: Response):
    try:
        request_body = await request.json()
        response_values = auth_usecase['LoginUsecase'](request_body['email'], request_body['password']).execute(response)
        return response_values
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/signin')
async def post_signin(request: Request):
    try:
        request_body = await request.json()
        response_values = auth_usecase['SigninUsecase'](request_body['email'], request_body['password'], request_body['confirm_password'], request_body['role']).execute()
        return response_values
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
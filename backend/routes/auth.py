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
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post('/signin')
async def post_signin(request: Request):
    try:
        request_body = await request.json()
        company_id = request_body.get('company_id')
        auth_usecase['SigninUsecase'](request_body['email'], request_body['password'], request_body['confirm_password'], request_body['role'], company_id).execute()
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
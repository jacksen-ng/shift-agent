from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..app.usecase.gemini import gemini_usecase
from ..app.service.auth import auth_services

app = APIRouter()

@app.post('/gemini-create-shift')
def gemini_create_shift(request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="owner")

        request_body = request.json()
        gemini_usecase['GeminiCreateShiftUseCase'](request_body['company_id'], request_body['first_day'], request_body['last_day'], request_body['comment']).execute()

    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/gemini-evaluate-shift')
def gemini_evaluate_shift(request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="owner")

        request_body = request.json()
        gemini_usecase['GeminiEvaluateShiftUseCase'](request_body['company_id'], request_body['first_day'], request_body['last_day']).execute()

    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
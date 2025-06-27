from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..app.usecase.gemini import gemini_usecase
from ..app.service.auth import auth_services

app = APIRouter()

@app.post('/gemini-create-shift')
def gemini_create_shift(request: Request, response: Response, company_id, first_day, last_day, comment):
    try:
        auth_services.verify_and_refresh_token(request, response, required_role="owner")

        gemini_usecase['GeminiCreateShiftUseCase'](company_id, first_day, last_day, comment).execute()

    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/gemini-evaluate-shift')
def gemini_evaluate_shift(request: Request, response: Response, company_id, first_day, last_day):
    try:
        auth_services.verify_and_refresh_token(request, response, required_role="owner")

        gemini_usecase['GeminiEvaluateShiftUseCase'](company_id, first_day, last_day).execute()

    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
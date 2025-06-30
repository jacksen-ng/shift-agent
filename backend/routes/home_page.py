from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..app.usecase.home_page import home_page_usecase
from ..app.service.auth import auth_services

app = APIRouter()

@app.get('/decision-shift')
def get_decision_shift(company_id, request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response)

        response_values = home_page_usecase['GetDecisionShiftUseCase'](company_id).execute()
        return response_values
    
    except HTTPException as e:
        raise e
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
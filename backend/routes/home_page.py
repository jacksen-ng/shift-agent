from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from ..app.usecase.home_page import home_page_usecase
from ..app.service.auth import auth_services

app = APIRouter()

@app.get('/decision-shift')
def get_decision_shift(company_id: int):
    try:
        # 認証機能が完了したらここで呼び出す

        response_values = home_page_usecase['GetDecisionShiftUseCase'](company_id).execute()
        return response_values
    
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
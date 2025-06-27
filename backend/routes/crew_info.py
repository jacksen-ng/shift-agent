from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from ..app.usecase.crew_info import crew_info_usecase
from ..app.service.auth import auth_services

app = APIRouter()

@app.get('/crew-info')
def get_crew_info(company_id):
    try:
        # 認証機能が完了したらここで呼び出す

        response_values = crew_info_usecase['GetCrewInfoUseCase'](company_id).execute()
        return response_values
    
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/crew-info-edit')
def edit_crew_info(
    user_id,
    name,
    age,
    phone,
    position,
    evaluate,
    join_company_day,
    hour_pay,
    post
):
    try:
        # 認証機能が完了したらここで呼び出す

        response_values = crew_info_usecase['EditCrewInfoUseCase'](
            user_id,
            name,
            age,
            phone,
            position,
            evaluate,
            join_company_day,
            hour_pay,
            post
        ).execute()
        return response_values
    
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
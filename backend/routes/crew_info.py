from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..app.usecase.crew_info import crew_info_usecase
from ..app.service.auth import auth_services

app = APIRouter()

@app.get('/crew-info')
def get_crew_info(request: Request, response: Response, company_id):
    try:
        auth_services.verify_and_refresh_token(request, response, required_role="owner")

        response_values = crew_info_usecase['GetCrewInfoUseCase'](company_id).execute()
        return response_values
    
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/crew-info-edit')
def edit_crew_info(request: Request, response: Response,
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
        auth_services.verify_and_refresh_token(request, response, required_role="owner")

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
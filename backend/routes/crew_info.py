from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..app.usecase.crew_info import crew_info_usecase
from ..app.service.auth import auth_services

app = APIRouter()

@app.get('/crew-info')
def get_crew_info(company_id, request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="owner")

        response_values = crew_info_usecase['GetCrewInfoUseCase'](company_id).execute()
        return response_values
    
    except HTTPException as e:
        raise e
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post('/crew-info-edit')
async def edit_crew_info(request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="owner")

        request_body = await request.json()
        crew_info_usecase['EditCrewInfoUseCase'](
            request_body['user_id'],
            request_body['name'],
            request_body['age'],
            request_body['phone'],
            request_body['position'],
            request_body['evaluate'],
            request_body['experience'],
            request_body['hour_pay'],
            request_body['post']
        ).execute()
    
    except HTTPException as e:
        raise e
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
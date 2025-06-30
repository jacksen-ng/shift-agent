from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..app.usecase.crew_shift import crew_shift_usecases
from ..app.service.auth import auth_services

app = APIRouter()

@app.post('/submitted-shift')
async def post_submit_shift(request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="crew")

        request_body = await request.json()
        crew_shift_usecases['PostSubmittedShiftUseCase'](
            request_body['company_member_info']['user_id'],
            request_body['company_member_info']['company_id'],
            request_body['submit_shift']
        ).execute()

    except HTTPException as e:  
        raise e
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
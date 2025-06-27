from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..app.usecase.crew_shift import crew_shift_usecases
from ..app.service.auth import auth_services

app = APIRouter()

@app.post('/submitted-shift')
def post_submit_shift(request: Request, response: Response, company_member_info, submit_shift):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="crew")

        crew_shift_usecases['PostSubmittedShiftUseCase'](company_member_info['user_id'], company_member_info['company_id'], submit_shift)

    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
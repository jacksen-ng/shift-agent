from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..app.usecase.owner_shift import owner_shift_usecase
from ..app.service.auth import auth_services

app = APIRouter()

@app.get('/edit-shift')
def get_shift_info(company_id, request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="owner")

        response_values = owner_shift_usecase['GetShiftInfoUseCase'](company_id).execute()
        return response_values
    
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/edit-shift')
async def edit_shift(request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="owner")

        request_body = await request.json()
        owner_shift_usecase['EditShiftUseCase'](
            request_body['company_id'],
            request_body['add_edit_shift'],
            request_body['update_edit_shift'],
            request_body['delete_edit_shift']
        ).execute()
    
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/complete_edit_shift')
async def complete_shift(request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="owner")

        request_body = await request.json()
        owner_shift_usecase['CompleteShiftUseCase'](request_body['company_id']).execute()

    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
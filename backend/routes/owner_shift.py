from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from ..app.usecase.owner_shift import owner_shift_usecase
from ..app.service.auth import auth_services

app = APIRouter()

@app.get('/edit-shift')
def get_shift_info(company_id):
    try:
        # 認証機能が完了したらここで呼び出す

        response_values = owner_shift_usecase['owner_shift_usecase'](company_id).execute()
        return response_values
    
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/edit-shift')
def edit_shift(company_id, add_edit_shift, update_edit_shift, delete_edit_shift):
    try:
        # 認証機能が完了したらここで呼び出す

        response_values = owner_shift_usecase['EditShiftUseCase'](
            company_id,
            add_edit_shift,
            update_edit_shift,
            delete_edit_shift
        ).execute()
        return response_values
    
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/complete_edit_sift')
def complete_shift(company_id):
    try:
        # 認証機能が完了したらここで呼び出す

        owner_shift_usecase['CompleteShiftUseCase'](company_id).execute()

    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
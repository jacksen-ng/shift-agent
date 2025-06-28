from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..app.usecase.company_info import company_info_usecase
from ..app.service.auth import auth_services

app = APIRouter()

@app.get('/company-info')
def get_company_info(company_id, request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="owner")

        response_values = company_info_usecase['GetCompanyInfoUseCase'](company_id).execute()
        return response_values
    
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
    
@app.post('/company-info-edit')
def edit_company_info(request: Request, response: Response):
    try:
        auth_services['verify_and_refresh_token'](request, response, required_role="owner")

        request_body = request.json()
        response_values = company_info_usecase['EditCompanyInfoUseCase'](
            request_body['company_info']['company_id'],
            request_body['company_info']['company_name'],
            request_body['company_info']['store_location'],
            request_body['company_info']['open_time'],
            request_body['company_info']['close_time'],
            request_body['company_info']['target_sales'],
            request_body['company_info']['labor_cast'],
            request_body['rest_day'],
            request_body['position']
        )
        return response_values
    
    except HTTPException as e:
        return JSONResponse(status_code=401, content={'message': e})
    
    except Exception as e:
        return JSONResponse(status_code=400, content={'message': e})
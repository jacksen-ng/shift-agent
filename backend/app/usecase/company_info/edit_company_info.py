from ....domain.validation.objects.company import company_validation
from ....domain.validation.objects.company_rest_day import company_rest_day_validation
from ....domain.validation.objects.company_position import company_position_validation
from ....domain.entity.company_info import company_info_entities
from ...repository.crud.company_info import company_info_repository

class EditCompanyInfoUseCase:
    def __init__(self, company_id, company_name, store_location, open_time, close_time, target_sales, labor_cast, rest_day, position):
        self.company_id = company_id
        self.company_name = company_name
        self.store_location = store_location
        self.open_time = open_time
        self.close_time = close_time
        self.target_sales = target_sales
        self.labor_cast = labor_cast
        self.rest_day = rest_day
        self.position = position

    def execute(self):
        company_id_validation = company_validation['CompanyIDValidation'](self.company_id).execute()
        company_name_validation = company_validation['CompanyNameValidation'](self.company_name).execute()
        store_location_validation = company_validation['StoreLocateValidation'](self.store_location).execute()
        open_time_validation = company_validation['OpenTimeValidation'](self.open_time).execute()
        close_time_validation = company_validation['CloseTimeValidation'](self.close_time).execute()
        target_sales_validation = company_validation['TargetSalesValidation'](self.target_sales).execute()
        labor_cost_validation = company_validation['LaborCostValidation'](self.labor_cast).execute()

        rest_day_validation = []
        for a_rest_day in self.rest_day:
            success_rest_day_validation = company_rest_day_validation['RestDayValidation'](a_rest_day).execute()
            rest_day_validation.append(success_rest_day_validation)

        position_validation = []
        for a_position in self.position:
            success_position_validation = company_position_validation['PositionNameValidation'](a_position).execute()
            position_validation.append(success_position_validation)

        edit_company_info_entity = company_info_entities['CompanyInfoEditEntity'](
            company_id_validation,
            company_name_validation,
            store_location_validation,
            open_time_validation,
            close_time_validation,
            target_sales_validation,
            labor_cost_validation,
            rest_day_validation,
            position_validation
        ).to_json()

        company_info_repository['company_info_edit_request'](
            edit_company_info_entity['company_id'],
            edit_company_info_entity['company_name'],
            edit_company_info_entity['store_location'],
            edit_company_info_entity['open_time'],
            edit_company_info_entity['close_time'],
            edit_company_info_entity['target_sales'],
            edit_company_info_entity['labor_cast'],
            edit_company_info_entity['rest_day'],
            edit_company_info_entity['position']
        )
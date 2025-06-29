from ....domain.validation.objects.company import company_validation
from ....domain.entity.owner_shift import owner_shift_entities
from ...repository.crud.edit_shift import edit_shift_repository

class GetShiftInfoUseCase:
    def __init__(self, company_id):
        self.company_id = company_id

    def execute(self):
        value_change_type = int(self.company_id)
        company_id_validation = company_validation['CompanyIDValidation'](value_change_type).execute()

        company_id_entity = owner_shift_entities['ShiftInfoEntity'](company_id_validation).to_json()

        return_values = edit_shift_repository['edit_shift_request'](company_id_entity)

        return return_values
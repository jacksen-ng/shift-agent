from ....domain.validation.objects.company import company_validation
from ....domain.entity.owner_shift import owner_shift_entities
from ...repository.crud.edit_shift import edit_shift_repository

class CompleteShiftUseCase:
    def __init__(self, company_id):
        self.company_id = company_id

    def execute(self):
        company_id_validation = company_validation['CompanyIDValidation'](self.company_id).execute()

        company_id_entity = owner_shift_entities['CompleteShiftEntity'](company_id_validation).to_json()

        edit_shift_repository['complete_edit_shift_request'](company_id_entity['company_id'])
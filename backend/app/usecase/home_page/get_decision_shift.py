from ....domain.validation.objects.company import company_validation
from ....domain.entity.home_page import home_page_entities
from ...repository.crud.decision_shift import decision_shift_repository

class GetDecisionShiftUseCase:
    def __init__(self, company_id):
        self.company_id = company_id

    def execute(self):
        value_change_type = int(self.company_id)
        company_id_validation = company_validation['CompanyIDValidation'](value_change_type).execute()
        company_id_entity = home_page_entities['DecisionShiftEntity'](company_id_validation).to_json()

        company_decision_shift = decision_shift_repository['decision_shift_request'](company_id_entity['company_id'])

        return company_decision_shift
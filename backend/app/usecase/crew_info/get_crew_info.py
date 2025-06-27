from ....domain.validation.objects.company import company_validation
from ....domain.entity.crew_info import crew_info_entities
from ...repository.crud.crew_info import crew_info_repository

class GetCrewInfoUseCase:
    def __init__(self, company_id):
        self.company_id = company_id

    def execute(self):
        company_id_validation = company_validation['CompanyIDValidation'](self.company_id).execute()

        company_id_entity = crew_info_entities['CrewInfoEntity'](company_id_validation).to_json()

        response_values = crew_info_repository['crew_info_request'](company_id_entity['company_id'])

        return response_values
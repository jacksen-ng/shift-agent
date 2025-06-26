from ....domain.validation.objects.company import company_validation
from ....domain.entity.company_info import company_info_entities
from ...repository.crud.company_info import company_info_repository

class GetCompanyInfoUseCase:
    def __init__(self,company_id):
        self.company_id = company_id

    def execute(self):
        # 認証機能が完成したら、ここで認証を行う

        company_id_validation = company_validation['CompanyIDValidation'](self.company_id).execute()
        company_id_entity = company_info_entities['CompanyInfoEntity'](company_id_validation).to_json()

        response_values = company_info_repository['company_info_request'](company_id_entity['company_id'])

        return response_values
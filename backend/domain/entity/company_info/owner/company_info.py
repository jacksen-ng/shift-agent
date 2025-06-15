class CompanyInfoEntity:
    def __init__(self, company_id):
        self.company_id = company_id
        
    def toJson(self):
        company_info_entity_toJson = {
            "company_id": self.company_id
        }
        return company_info_entity_toJson
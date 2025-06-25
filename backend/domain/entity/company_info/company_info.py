class CompanyInfoEntity:
    def __init__(self, company_id):
        self.company_id = company_id
        
    def to_json(self):
        company_info_entity_to_json = {
            "company_id": self.company_id
        }
        return company_info_entity_to_json
class CrewInfoEntity:
    def __init__(self, company_id):
        self.company_id = company_id
        
    def toJson(self):
        crew_info_entity_toJson = [
            {
                "company_id": self.company_id
            }
        ]
        return crew_info_entity_toJson
class CrewInfoEntity:
    def __init__(self, company_id):
        self.company_id = company_id
        
    def to_json(self):
        crew_info_entity_to_json = [
            {
                "company_id": self.company_id
            }
        ]
        return crew_info_entity_to_json
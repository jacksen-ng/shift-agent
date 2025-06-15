class DecisionShiftEntity:
    def __init__(self, company_id):
        self.company_id = company_id
        
    def toJson(self):
        decision_shift_entity_toJson = {
            "company_id": self.company_id
        }
        return decision_shift_entity_toJson
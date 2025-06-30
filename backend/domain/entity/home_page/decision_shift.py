class DecisionShiftEntity:
    def __init__(self, company_id):
        self.company_id = company_id
        
    def to_json(self):
        decision_shift_entity_to_json = {
            "company_id": self.company_id
        }
        return decision_shift_entity_to_json
class EvaluateShiftEntity:
    def __init__(self, company_id, first_day, last_day):
        self.company_id = company_id
        self.first_day = first_day
        self.last_day = last_day

    def to_json(self):
        evaluate_shift_entity_to_json = {
            "company_id": self.company_id,
            "first_day": self.first_day,
            "last_day": self.last_day
        }
        return evaluate_shift_entity_to_json
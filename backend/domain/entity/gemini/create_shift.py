class CreateShiftEntity:
    def __init__(self, company_id, first_day, last_day, comment):
        self.company_id = company_id
        self.first_day = first_day
        self.last_day = last_day
        self.comment = comment

    def to_json(self):
        create_shift_entity_to_json = {
            "company_id": self.company_id,
            "first_day": self.first_day,
            "last_day": self.last_day,
            "comment": self.comment
        }
        return create_shift_entity_to_json
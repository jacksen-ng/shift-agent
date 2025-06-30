class CompleteShiftEntity:
    def __init__ (self, company_id):
        self.company_id = company_id

    def to_json(self):
        complete_shift_to_json = {
            'company_id': self.company_id
        }

        return complete_shift_to_json
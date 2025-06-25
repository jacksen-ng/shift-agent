class ShiftInfoEntity:
    def __init__(self, company_id):
        self.company_id = company_id

    def to_json(self):
        shift_info_to_json = {
            "company_id": self.company_id
        }

        return shift_info_to_json
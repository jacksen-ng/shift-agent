class SubmittedShiftEntity:
    def __init__(self, user_id, company_id, submit_shift):
        self.user_id = user_id
        self.company_id = company_id
        self.submit_shift = submit_shift
        
    def to_json(self):
        submitted_shift_entity_to_json = {
            'company_member_info': {
                'user_id': self.user_id,
                'company_id': self.company_id,
            },
            'submit_shift': self.submit_shift
        }
        return submitted_shift_entity_to_json
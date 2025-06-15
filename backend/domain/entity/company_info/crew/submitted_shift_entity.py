class SubmittedShiftEntity:
    def __init__(self, user_id, company_id, day, start_time, finish_time):
        self.user_id = user_id
        self.company_id = company_id
        self.day = day
        self.start_time = start_time
        self.finish_time = finish_time
        
    def toJson(self):
        submitted_shift_entity_toJson = [
            {
                "user_id": self.user_id,
                "company_id": self.company_id,
            },
            {
                "day": self.day,
                "start_time": self.start_time,
                "finish_time": self.finish_time
            }
        ]
        return submitted_shift_entity_toJson
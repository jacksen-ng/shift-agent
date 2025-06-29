class CrewInfoEditEntity:
    def __init__(self,
                user_id,
                name,
                age,
                phone,
                position,
                evaluate,
                experience,
                hour_pay,
                post):
        self.user_id = user_id
        self.name = name
        self.age = age
        self.phone = phone
        self.position = position
        self.evaluate = evaluate
        self.experience = experience
        self.hour_pay = hour_pay
        self.post = post
        
    def to_json(self):
        crew_info_edit_entity_to_json = {
            "user_id": self.user_id,
            "name": self.name,
            "age": self.age,
            "phone": self.phone,
            "position": self.position,
            "evaluate": self.evaluate,
            "experience": self.experience,
            "hour_pay": self.hour_pay,
            "post": self.post
        }
        return crew_info_edit_entity_to_json
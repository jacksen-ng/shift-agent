import datetime

from ...models.guard_types import type_models

class FinishTimeValidation:
    def __init__(self, value: datetime.time):
        self.value = value
    
    def execute(self):
        validated_value = type_models['TimeType'](self.value).execute()
        
        return validated_value
import datetime

from ...models.guard_types import type_models

class CloseTimeValidation:
    def __init__(self, value: datetime.time):
        self.value = value
    
    def execute(self):
        validated_value = type_models['TimeType'](self.value).execute()
        
        return validated_value
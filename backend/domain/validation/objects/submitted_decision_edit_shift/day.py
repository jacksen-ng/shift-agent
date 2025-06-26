from datetime import date

from ...models.guard_types import type_models

class DayValidation:
    def __init__(self, value: date):
        self.value = value
    
    def execute(self):
        validated_value = type_models['DateType'](self.value).execute()
        
        return validated_value
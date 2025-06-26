
from ...models.guard_types import type_models

class CompanyNameValidation:
    def __init__(self, value: str):
        self.value = value
    
    def execute(self):
        validated_value = type_models['StringType'](self.value).execute()
        
        return validated_value
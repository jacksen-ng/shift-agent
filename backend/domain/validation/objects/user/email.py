from ...models.guard_types import type_models
from ...models.rules import rule_models

class EmailValidation:
    def __init__(self, value: str):
        self.value = value
    
    def execute(self):
        type_validated_value = type_models['StringType'](self.value).execute()
        validated_value = rule_models['InAtmarkRule'](type_validated_value).execute()
        
        return validated_value
from ...models.guard_types import type_models

class FirebaseUIDValidation:
    def __init__(self, value: int):
        self.value = value
    
    def execute(self):
        validated_value = type_models['IntegerType'](self.value).execute()
        
        return validated_value
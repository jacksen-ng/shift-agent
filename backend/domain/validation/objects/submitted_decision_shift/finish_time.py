import os
import sys
import time

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from models.guard_types import type_models

class FinishTimeValidation:
    def __init__(self, value: time):
        self.value = value
    
    def execute(self):
        validated_value = type_models['TimeType'](self.value).execute()
        
        return validated_value
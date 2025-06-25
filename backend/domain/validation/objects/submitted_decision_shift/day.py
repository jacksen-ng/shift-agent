import os
import sys
from datetime import date

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from models.guard_types import type_models

class DayValidation:
    def __init__(self, value: date):
        self.value = value
    
    def execute(self):
        validated_value = type_models['DateType'](self.value).execute()
        
        return validated_value
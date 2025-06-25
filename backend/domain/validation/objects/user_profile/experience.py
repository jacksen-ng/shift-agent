import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from models.guard_types import type_models
from models.rules import rule_models

class ExperienceValidation:
    def __init__(self, value: str):
        self.value = value
    
    def execute(self):
        type_validated_value = type_models['StringType'](self.value).execute()
        validated_value = rule_models['LiteralExperience'](type_validated_value).execute()
        
        return validated_value
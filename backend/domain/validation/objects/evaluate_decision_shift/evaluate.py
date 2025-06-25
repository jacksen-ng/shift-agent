import os
import sys
from typing_extensions import Literal

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from models.guard_types import type_models

class EvaluateValidation:
    def __init__(self, value: Literal[1, 2, 3, 4, 5]):
        self.value = value
    
    def execute(self):
        validated_value = type_models['IntegerType'](self.value).execute()
        
        return validated_value
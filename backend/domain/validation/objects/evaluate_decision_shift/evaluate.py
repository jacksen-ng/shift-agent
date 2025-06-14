import os
import sys
from typing_extensions import Literal

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import guard_types
import rules

class Evaluate:
    def __init__(self, value: Literal[1, 2, 3, 4, 5]):
        self.value = rules.LiteralEvaluate(value).execute()
    
    def execute(self):
        return self.value
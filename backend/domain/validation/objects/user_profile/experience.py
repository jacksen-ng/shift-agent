import os
import sys
from typing_extensions import Literal

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import rules

class Experience:
    def __init__(self, value: Literal['veteran', 'beginner']):
        self.value = rules.LiteralExperience(value).execute()
    
    def execute(self):
        return self.value
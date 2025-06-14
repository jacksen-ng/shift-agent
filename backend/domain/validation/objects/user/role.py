import os
import sys
from typing_extensions import Literal

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import rules

class Role:
    def __init__(self, value: Literal['owner', 'crew']):
        self.value = rules.LiteralRole(value).execute()
    
    def execute(self):
        return self.value
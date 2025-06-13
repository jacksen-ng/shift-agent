import os
import sys
from typing_extensions import Literal

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import guard_types

class Role:
    def __init__(self, value: Literal['owner', 'crew']):
        self.value = guard_types.LiteralRole(value).execute()
    
    def execute(self):
        return self.value
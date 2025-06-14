import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import guard_types

class PositionName:
    def __init__(self, value: str):
        self.value = guard_types.StringType(value).execute()
    
    def execute(self):
        return self.value
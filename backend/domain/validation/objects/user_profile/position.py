import os
import sys
import time

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import guard_types

class Position:
    def __init__(self, value: str):
        self.value = guard_types.StringType(value).execute()
    
    def execute(self):
        return self.value
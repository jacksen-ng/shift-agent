import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import guard_types

class CompanyID:
    def __init__(self, value: int):
        self.value = guard_types.IntegerType(value).execute()
    
    def execute(self):
        return self.value
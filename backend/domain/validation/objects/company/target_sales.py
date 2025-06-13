import os
import sys
import time

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import guard_types

class TargetSales:
    def __init__(self, value: int):
        self.value = guard_types.IntegerType(value).execute()
    
    def execute(self):
        return self.value
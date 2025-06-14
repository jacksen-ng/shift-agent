import os
import sys
from datetime import date

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import guard_types

class FinishDay:
    def __init__(self, value: date):
        self.value = guard_types.DateType(value).execute()
    
    def execute(self):
        return self.value
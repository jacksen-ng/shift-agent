import os
import sys
import time

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import guard_types

class StartTime:
    def __init__(self, value: time):
        self.value = guard_types.TimeType(value).execute()
    
    def execute(self):
        return self.value
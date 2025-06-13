import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import guard_types

class UserID:
    def __init__(self, value: int):
        self.value = guard_types.IntegerType(value).execute()
    
    def execute(self):
        if self.value <= 0:
            raise ValueError("ユーザーIDは正の整数である必要があります")
        return self.value

import os
import sys
import time
from typing_extensions import Literal

sys.path.append(os.path.join(os.path.dirname(__file__), "../../models"))
import rules

class Post:
    def __init__(self, value: Literal['employee', 'part_timer']):
        self.value = rules.LiteralPost(value).execute()
    
    def execute(self):
        return self.value
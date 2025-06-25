import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from crew_shift.submitted_shift import SubmittedShiftEntity

crew_shift_entities = [
    SubmittedShiftEntity
]
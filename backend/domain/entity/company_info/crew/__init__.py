import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from crew.submitted_shift import SubmittedShiftEntity

crew_entities = {
    "SubmittedShiftEntity": SubmittedShiftEntity
}
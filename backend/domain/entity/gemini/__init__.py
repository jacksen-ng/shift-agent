import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from gemini.create_shift import CreateShiftEntity
from gemini.evaluate_shift import EvaluateShiftEntity

gemini_entities = {
    "CreateShiftEntity": CreateShiftEntity,
    "EvaluateShiftEntity": EvaluateShiftEntity
}
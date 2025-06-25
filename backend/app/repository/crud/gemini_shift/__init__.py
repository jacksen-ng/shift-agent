import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from .gemini_create_shift import gemini_create_shift
from .gemini_evaluate_shift import gemini_evaluate_shift

gemini_shift_repository = {
    "gemini_create_shift": gemini_create_shift,
    "gemini_evaluate_shift": gemini_evaluate_shift
}
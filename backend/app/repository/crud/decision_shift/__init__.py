import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from .decision_shift_request import decision_shift_request

decision_shift_repository = {
    "decision_shift_request": decision_shift_request
}
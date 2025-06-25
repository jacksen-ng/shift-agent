import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from .submitted_shift_request import submitted_shift_request

crew_submitted_shift_repository = {
    "submitted_shift_request": submitted_shift_request
}
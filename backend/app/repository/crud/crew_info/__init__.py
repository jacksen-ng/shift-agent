import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from .crew_info_edit_request import crew_info_edit_request
from .crew_info_request import crew_info_request

crew_info_repository = {
    "crew_info_edit_request": crew_info_edit_request,
    "crew_info_request": crew_info_request
}
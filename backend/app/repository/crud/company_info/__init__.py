import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from .company_info_request import company_info_request
from .company_info_edit_request import company_info_edit_request

company_info_repository = {
    "company_info_request": company_info_request,
    "company_info_edit_request": company_info_edit_request
}
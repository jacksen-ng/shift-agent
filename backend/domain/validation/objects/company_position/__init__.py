import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from company_position.company_id import CompanyIDValidation
from company_position.company_position_id import CompanyPositionIDValidation
from company_position.position_name import PositionNameValidation

company_position_validation = {
    'CompanyIDValidation': CompanyIDValidation,
    'CompanyPositionIDValidation': CompanyPositionIDValidation,
    'PositionNameValidation': PositionNameValidation
}
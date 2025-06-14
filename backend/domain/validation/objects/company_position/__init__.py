import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from company_position.company_id import CompanyID
from company_position.company_position_id import CompanyPositionID
from company_position.position_name import PositionName

CompanyPositionModels = {
    'CompanyID': CompanyID,
    'CompanyPositionID': CompanyPositionID,
    'PositionName': PositionName
}
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from company_rest_day.company_id import CompanyID
from company_rest_day.company_rest_day_id import CompanyRestDayID
from company_rest_day.rest_day import RestDay

CompanyRestDayModels = {
    'CompanyID': CompanyID,
    'CompanyRestDayID': CompanyRestDayID,
    'RestDay': RestDay
}
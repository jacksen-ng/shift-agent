import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from company_rest_day.company_rest_day_id import CompanyRestDayIDValidation
from company_rest_day.company_id import CompanyIDValidation
from company_rest_day.rest_day import RestDayValidation

company_rest_day_validation = {
    'CompanyRestDayIDValidation': CompanyRestDayIDValidation,
    'CompanyIDValidation': CompanyIDValidation,
    'RestDayValidation': RestDayValidation
}
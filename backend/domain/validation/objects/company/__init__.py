import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from company.company_id import CompanyIDValidation
from company.company_name import CompanyNameValidation
from company.store_locate import StoreLocateValidation
from company.open_time import OpenTimeValidation
from company.close_time import CloseTimeValidation
from company.target_sales import TargetSalesValidation
from company.labor_cost import LaborCostValidation

company_validation = {
    'CompanyIDValidation': CompanyIDValidation,
    'CompanyNameValidation': CompanyNameValidation,
    'StoreLocateValidation': StoreLocateValidation,
    'OpenTimeValidation': OpenTimeValidation,
    'CloseTimeValidation': CloseTimeValidation,
    'TargetSalesValidation': TargetSalesValidation,
    'LaborCostValidation': LaborCostValidation
}
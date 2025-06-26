from .company_id import CompanyIDValidation
from .company_name import CompanyNameValidation
from .store_locate import StoreLocateValidation
from .open_time import OpenTimeValidation
from .close_time import CloseTimeValidation
from .target_sales import TargetSalesValidation
from .labor_cost import LaborCostValidation

company_validation = {
    'CompanyIDValidation': CompanyIDValidation,
    'CompanyNameValidation': CompanyNameValidation,
    'StoreLocateValidation': StoreLocateValidation,
    'OpenTimeValidation': OpenTimeValidation,
    'CloseTimeValidation': CloseTimeValidation,
    'TargetSalesValidation': TargetSalesValidation,
    'LaborCostValidation': LaborCostValidation
}
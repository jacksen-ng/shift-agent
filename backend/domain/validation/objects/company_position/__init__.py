from .company_id import CompanyIDValidation
from .company_position_id import CompanyPositionIDValidation
from .position_name import PositionNameValidation

company_position_validation = {
    'CompanyIDValidation': CompanyIDValidation,
    'CompanyPositionIDValidation': CompanyPositionIDValidation,
    'PositionNameValidation': PositionNameValidation
}
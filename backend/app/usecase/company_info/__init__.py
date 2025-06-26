import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from company_info.get_company_info import GetCompanyInfoUseCase

company_info_usecase = {
    'GetCompanyInfoUseCase': GetCompanyInfoUseCase
}
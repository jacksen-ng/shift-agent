import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from company_info.company_info import CompanyInfoEntity
from company_info.company_info_edit import CompanyInfoEditEntity

company_info_entities = {
    "CompanyInfoEntity": CompanyInfoEntity,
    "CompanyInfoEditEntity": CompanyInfoEditEntity
}
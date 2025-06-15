import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from company_info import CompanyInfoEntity
from company_info_edit import CompanyInfoEditEntity

owner_entities = {
    "CompanyInfoEntity": CompanyInfoEntity,
    "CompanyInfoEditEntity": CompanyInfoEditEntity
}
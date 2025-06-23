import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from owner.company_info import CompanyInfoEntity
from owner.company_info_edit import CompanyInfoEditEntity

owner_entities = {
    "CompanyInfoEntity": CompanyInfoEntity,
    "CompanyInfoEditEntity": CompanyInfoEditEntity
}
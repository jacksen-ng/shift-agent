import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from company.company_id import CompanyID
from company.company_name import CompanyName
from company.store_locate import StoreLocate
from company.open_time import OpenTime
from company.close_time import CloseTime
from company.target_sales import TargetSales
from company.labor_cost import LaborCost

TypeModels = {
    'CompanyID': CompanyID,
    'CompanyName': CompanyName,
    'StoreLocate': StoreLocate,
    'OpenTime': OpenTime,
    'CloseTime': CloseTime,
    'TargetSales': TargetSales,
    'LaberCost': LaborCost
}
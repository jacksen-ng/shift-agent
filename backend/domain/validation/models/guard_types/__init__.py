import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from guard_types.integer import IntegerType
from guard_types.string import StringType
from guard_types.date import DateType
from guard_types.time import TimeType

type_models = {
    'IntegerType': IntegerType,
    'StringType': StringType,
    'DateType': DateType,
    'TimeType': TimeType
}
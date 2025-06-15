import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from decision_shift_entity import DecisionShiftEntity

home_page_entities = {
    "DecisionShiftEntity": DecisionShiftEntity
}
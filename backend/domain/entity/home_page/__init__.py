import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from home_page.decision_shift import DecisionShiftEntity

home_page_entities = {
    "DecisionShiftEntity": DecisionShiftEntity
}
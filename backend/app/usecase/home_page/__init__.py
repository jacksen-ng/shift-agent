import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from home_page.get_decision_shift import GetDecisionShiftUseCase

home_page_usecases = {
    'GetDecisionShiftUseCase': GetDecisionShiftUseCase
}
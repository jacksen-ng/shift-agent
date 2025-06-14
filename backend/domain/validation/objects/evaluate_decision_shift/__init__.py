import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from evaluate_decision_shift.evaluate_decision_shift_id import EvaluateDecisionShiftID
from evaluate_decision_shift.start_day import StartDay
from evaluate_decision_shift.finish_day import FinishDay
from evaluate_decision_shift.is_completed import IsCompleted
from evaluate_decision_shift.evaluate import Evaluate

EvaluateDecisionShiftModels = {
    'EvaluateDecisionShiftID': EvaluateDecisionShiftID,
    'StartDay': StartDay,
    'FinishDay': FinishDay,
    'IsCompleted': IsCompleted,
    'Evaluate': Evaluate
}
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from evaluate_decision_shift.evaluate_decision_shift_id import EvaluateDecisionShiftIDValidation
from evaluate_decision_shift.start_day import StartDayValidation
from evaluate_decision_shift.finish_day import FinishDayValidation
from evaluate_decision_shift.is_completed import IsCompletedValidation
from evaluate_decision_shift.evaluate import EvaluateValidation

EvaluateDecisionShiftModels = {
    'EvaluateDecisionShiftIDValidation': EvaluateDecisionShiftIDValidation,
    'StartDayValidation': StartDayValidation,
    'FinishDayValidation': FinishDayValidation,
    'IsCompletedValidation': IsCompletedValidation,
    'EvaluateValidation': EvaluateValidation
}
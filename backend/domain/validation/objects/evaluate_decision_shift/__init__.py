from .evaluate_decision_shift_id import EvaluateDecisionShiftIDValidation
from .start_day import StartDayValidation
from .finish_day import FinishDayValidation
from .evaluate import EvaluateValidation

evaluate_decision_edit_shift_validation = {
    'EvaluateDecisionShiftIDValidation': EvaluateDecisionShiftIDValidation,
    'StartDayValidation': StartDayValidation,
    'FinishDayValidation': FinishDayValidation,
    'EvaluateValidation': EvaluateValidation
}
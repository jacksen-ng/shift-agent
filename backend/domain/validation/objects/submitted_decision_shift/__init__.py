import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from submitted_decision_shift.submitted_shift_id import SubmittedShiftIDValidation
from submitted_decision_shift.decision_shift_id import DecisionShiftIDValidation
from submitted_decision_shift.user_id import UserIDValidation
from submitted_decision_shift.company_id import CompanyIDValidation
from submitted_decision_shift.day import DayValidation
from submitted_decision_shift.start_time import StartTimeValidation
from submitted_decision_shift.finish_time import FinishTimeValidation

SubmittedDecisionShiftModels = {
    'SubmittedShiftIDValidation': SubmittedShiftIDValidation,
    'DecisionShiftIDValidation': DecisionShiftIDValidation,
    'UserIDValidation': UserIDValidation,
    'CompanyIDValidation': CompanyIDValidation,
    'DayValidation': DayValidation,
    'StartTimeValidation': StartTimeValidation,
    'FinishTimeValidation': FinishTimeValidation
}

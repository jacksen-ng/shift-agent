import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from submitted_decision_edit_shift.submitted_shift_id import SubmittedShiftIDValidation
from submitted_decision_edit_shift.decision_shift_id import DecisionShiftIDValidation
from submitted_decision_edit_shift.edit_shift_id import EditShiftIDValidation
from submitted_decision_edit_shift.user_id import UserIDValidation
from submitted_decision_edit_shift.company_id import CompanyIDValidation
from submitted_decision_edit_shift.day import DayValidation
from submitted_decision_edit_shift.start_time import StartTimeValidation
from submitted_decision_edit_shift.finish_time import FinishTimeValidation

submitted_decision_edit_shift_validation = {
    'SubmittedShiftIDValidation': SubmittedShiftIDValidation,
    'DecisionShiftIDValidation': DecisionShiftIDValidation,
    'EditShiftIDValidation': EditShiftIDValidation,
    'UserIDValidation': UserIDValidation,
    'CompanyIDValidation': CompanyIDValidation,
    'DayValidation': DayValidation,
    'StartTimeValidation': StartTimeValidation,
    'FinishTimeValidation': FinishTimeValidation
}

from .submitted_shift_id import SubmittedShiftIDValidation
from .decision_shift_id import DecisionShiftIDValidation
from .edit_shift_id import EditShiftIDValidation
from .user_id import UserIDValidation
from .company_id import CompanyIDValidation
from .day import DayValidation
from .start_time import StartTimeValidation
from .finish_time import FinishTimeValidation

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

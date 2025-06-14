import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from submitted_decision_shift.submitted_shift_id import SubmittedShiftID
from submitted_decision_shift.decision_shift_id import DecisionShiftID
from submitted_decision_shift.user_id import UserID
from submitted_decision_shift.company_id import CompanyID
from submitted_decision_shift.day import Day
from submitted_decision_shift.start_time import StartTime
from submitted_decision_shift.finish_time import FinishTime

SubmittedDecisionShiftModels = {
    'SubmittedShiftID': SubmittedShiftID,
    'DecisionShiftID': DecisionShiftID,
    'UserID': UserID,
    'CompanyID': CompanyID,
    'Day': Day,
    'StartTime': StartTime,
    'FinishTime': FinishTime
}

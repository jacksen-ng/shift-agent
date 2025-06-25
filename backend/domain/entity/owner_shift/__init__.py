import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from owner_shift.shift_info import ShiftInfoEntity
from owner_shift.edit_shift import EditShiftEntity
from owner_shift.complete_shift import CompleteShiftEntity

owner_shift_entities = {
    'ShiftInfoEntity': ShiftInfoEntity,
    'EditShiftEntity': EditShiftEntity,
    'CompleteShiftEntity': CompleteShiftEntity
}
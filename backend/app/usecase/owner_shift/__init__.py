from .get_shift_info import GetShiftInfoUseCase
from .edit_shift import EditShiftUseCase
from .complete_shift import CompleteShiftUseCase

owner_shift_usecase = {
    'GetShiftInfoUseCase': GetShiftInfoUseCase,
    'EditShiftUseCase': EditShiftUseCase,
    'CompleteShiftUseCase': CompleteShiftUseCase
}
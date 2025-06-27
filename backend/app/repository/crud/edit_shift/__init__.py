from .complete_edit_shift_request import complete_edit_shift_request
from .edit_shift_request import edit_shift_request
from .delete_shift_request import delete_shift_request
from .update_shift_request import update_shift_request
from .insert_shift_request import insert_shift_request
from .gemini_delete_shift import gemini_delete_shift

edit_shift_repository = {
    "complete_edit_shift_request": complete_edit_shift_request,
    "edit_shift_request": edit_shift_request,
    "delete_shift_request": delete_shift_request,
    "update_shift_request": update_shift_request,
    "insert_shift_request": insert_shift_request,
    "gemini_delete_shift": gemini_delete_shift
}
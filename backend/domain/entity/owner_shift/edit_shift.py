class EditShiftEntity:
    def __init__(self, company_id, add_edit_shift, update_shift, delete_shift):
        self.company_id = company_id
        self.add_edit_shift = add_edit_shift
        self.update_shift = update_shift
        self.delete_shift = delete_shift

    def to_json(self):
        edit_shift_to_json = {
            "company_id": self.company_id,
            "add_edit_shift": self.add_edit_shift,
            "update_shift": self.update_shift,
            "delete_shift": self.delete_shift
        }

        return edit_shift_to_json
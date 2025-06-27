from ....domain.validation.objects.company import company_validation
from ....domain.validation.objects.submitted_decision_edit_shift import submitted_decision_edit_shift_validation
from ....domain.entity.owner_shift import owner_shift_entities
from ...repository.crud.edit_shift import edit_shift_repository

class EditShiftUseCase:
    def __init__(self, company_id, add_edit_shift, update_edit_shift, delete_edit_shift):
        self.company_id = company_id
        self.add_edit_shift = add_edit_shift
        self.update_edit_shift = update_edit_shift
        self.delete_edit_shift = delete_edit_shift

    def execute(self):
        company_id_validation = company_validation['CompanyIDValidation'](self.company_id).execute()

        add_edit_shift_validation = []
        for an_add_shift in self.add_edit_shift:
            user_id_validation = submitted_decision_edit_shift_validation['UserIDValidation'](an_add_shift['user_id']).execute()
            day_validation = submitted_decision_edit_shift_validation['DayValidation'](an_add_shift['day']).execute()
            start_time_validation = submitted_decision_edit_shift_validation['StartTimeValidation'](an_add_shift['start_time']).execute()
            finish_time_validation = submitted_decision_edit_shift_validation['FinishTimeValidation'](an_add_shift['finish_time']).execute()
            add_edit_shift_validation.append({
                'user_id': user_id_validation,
                'company_id': company_id_validation,
                'day': day_validation,
                'start_time': start_time_validation,
                'finish_time': finish_time_validation
            })

        update_edit_shift_validation = []
        for an_update_shift in self.update_edit_shift:
            edit_shift_id_validation = submitted_decision_edit_shift_validation['EditShiftIDValidation'](an_update_shift['edit_shift_id']).execute()
            start_time_validation = submitted_decision_edit_shift_validation['StartTimeValidation'](an_update_shift['start_time']).execute()
            finish_time_validation = submitted_decision_edit_shift_validation['FinishTimeValidation'](an_update_shift['finish_time']).execute()
            update_edit_shift_validation.append({
                'edit_shift_id': edit_shift_id_validation,
                'start_time': start_time_validation,
                'finish_time': finish_time_validation
            })

        delete_edit_shift_validation = []
        for a_delete_shift in self.delete_edit_shift:
            edit_shift_id_validation = submitted_decision_edit_shift_validation['EditShiftIDValidation'](a_delete_shift['edit_shift_id']).execute()
            delete_edit_shift_validation.append(edit_shift_id_validation)

        edit_shift_entity = owner_shift_entities['EditShiftEntity'](
            company_id_validation,
            add_edit_shift_validation,
            update_edit_shift_validation,
            delete_edit_shift_validation
        ).to_json()

        edit_shift_repository['delete_shift_request'](edit_shift_entity['delete_shift'])
        edit_shift_repository['update_shift_request'](edit_shift_entity['update_shift'])
        edit_shift_repository['insert_shift_request'](edit_shift_entity['add_edit_shift'])
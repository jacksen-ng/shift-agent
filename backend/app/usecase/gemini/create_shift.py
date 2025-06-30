from ....domain.validation.objects.submitted_decision_edit_shift import submitted_decision_edit_shift_validation
from ....domain.entity.gemini import gemini_entities
from ...repository.crud.gemini_shift import gemini_shift_repository
from ...repository.crud.edit_shift import edit_shift_repository
from ...service.agent.module.shift_creator import shift_creator_run
from datetime import time
import json

class GeminiCreateShiftUseCase:
    def __init__(self, company_id, first_day, last_day, comment):
        self.company_id = company_id
        self.first_day = first_day
        self.last_day = last_day
        self.comment = comment

    def execute(self):
        company_id_validation = submitted_decision_edit_shift_validation['CompanyIDValidation'](self.company_id).execute()
        first_day_validation = submitted_decision_edit_shift_validation['DayValidation'](self.first_day).execute()
        last_day_validation = submitted_decision_edit_shift_validation['DayValidation'](self.last_day).execute()

        shift_rules_entity = gemini_entities['CreateShiftEntity'](
            company_id_validation,
            first_day_validation,
            last_day_validation,
            self.comment
        ).to_json()

        detail_shifst_rules = gemini_shift_repository['gemini_create_shift'](
            shift_rules_entity['company_id'],
            shift_rules_entity['first_day'],
            shift_rules_entity['last_day']
        )

        detail_shifst_rules['company_info']['comment'] = shift_rules_entity['comment']
        detail_shifst_rules['company_info']['open_time'] = detail_shifst_rules['company_info']['open_time'].strftime("%H:%M:%S")
        detail_shifst_rules['company_info']['close_time'] = detail_shifst_rules['company_info']['close_time'].strftime("%H:%M:%S")

        edit_shift_gemini = shift_creator_run(json.dumps(detail_shifst_rules))
        edit_shift_gemini_json = json.loads(edit_shift_gemini)

        edit_shift_repository['gemini_delete_shift'](
            shift_rules_entity['company_id'],
            shift_rules_entity['first_day'],
            shift_rules_entity['last_day']
        )

        edit_shift_repository['insert_shift_request'](edit_shift_gemini_json['edit_shift'])
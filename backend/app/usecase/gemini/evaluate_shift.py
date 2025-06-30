from ....domain.validation.objects.submitted_decision_edit_shift import submitted_decision_edit_shift_validation
from ....domain.entity.gemini import gemini_entities
from ...repository.crud.gemini_shift import gemini_shift_repository
from ...service.agent.module.shift_creator import eval_final_shift_tool
import json

class GeminiEvaluateShiftUseCase:
    def __init__(self, company_id, first_day, last_day):
        self.company_id = company_id
        self.first_day = first_day
        self.last_day = last_day

    def execute(self):
        company_id_validation = submitted_decision_edit_shift_validation['CompanyIDValidation'](self.company_id).execute()
        first_day_validation = submitted_decision_edit_shift_validation['DayValidation'](self.first_day).execute()
        last_day_validation = submitted_decision_edit_shift_validation['DayValidation'](self.last_day).execute()

        evaluate_rules_entity = gemini_entities['EvaluateShiftEntity'](
            company_id_validation,
            first_day_validation,
            last_day_validation
        ).to_json()

        detail_shift = gemini_shift_repository['gemini_evaluate_shift'](
            evaluate_rules_entity['company_id'],
            evaluate_rules_entity['first_day'],
            evaluate_rules_entity['last_day']
        )

        detail_shift['company_info']['open_time'] = detail_shift['company_info']['open_time'].strftime("%H:%M:%S")
        detail_shift['company_info']['close_time'] = detail_shift['company_info']['close_time'].strftime("%H:%M:%S")

        evalute_shift_gemini = eval_final_shift_tool(json.dumps(detail_shift))
        evalute_shift_gemini_json = json.loads(evalute_shift_gemini)

        return evalute_shift_gemini_json
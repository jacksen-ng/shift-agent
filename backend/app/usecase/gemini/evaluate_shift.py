from ....domain.validation.objects.submitted_decision_edit_shift import submitted_decision_edit_shift_validation
from ....domain.entity.gemini import gemini_entities
from ...repository.crud.gemini_shift import gemini_shift_repository
# from ...service.agent.module import

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

        # データ整形必要であればデータ整形

        # detail_shift_rules をgeminiに送信する
        # evalute_shift_gemini = detail_shift

        # return evalute_shift_gemini
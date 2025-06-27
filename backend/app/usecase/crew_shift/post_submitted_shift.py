from ....domain.validation.objects.submitted_decision_edit_shift import submitted_decision_edit_shift_validation
from ....domain.entity.crew_shift import crew_shift_entities
from ...repository.crud.crew_submitted_shift import crew_submitted_shift_repository

class PostSubmittedShiftUseCase:
    def __init__(self, user_id, company_id, submit_shift):
        self.user_id = user_id
        self.company_id = company_id
        self.submit_shift = submit_shift
        
    def execute(self):
        user_id_validation = submitted_decision_edit_shift_validation['UserIDValidation'](self.user_id).execute()
        company_id_validation = submitted_decision_edit_shift_validation['CompanyIDValidation'](self.company_id).execute()
        
        submit_shift_validation = []
        for a_submit_shift in self.submit_shift:
            day_validation = submitted_decision_edit_shift_validation['DayValidation'](a_submit_shift['day']).execute()
            start_time_validation = submitted_decision_edit_shift_validation['StartTimeValidation'](a_submit_shift['start_time']).execute()
            finish_time_validation = submitted_decision_edit_shift_validation['FinishTimeValidation'](a_submit_shift['finish_time']).execute()
            
            submit_shift_validation.append({
                'day': day_validation,
                'start_time': start_time_validation,
                'finish_time': finish_time_validation
            })
            
        submitted_shift_entity = crew_shift_entities['SubmittedShiftEntity'](
            user_id_validation,
            company_id_validation,
            submit_shift_validation
        ).to_json()
        
        submitted_shift_json = []
        for a_submit_shift in submitted_shift_entity['submit_shift']:
            submitted_shift_json.append({
                'user_id': submitted_shift_entity['company_member_info']['user_id'],
                'company_id': submitted_shift_entity['company_member_info']['company_id'],
                'day': a_submit_shift['day'],
                'start_time': a_submit_shift['start_time'],
                'finish_time': a_submit_shift['finish_time']
            })
        
        crew_submitted_shift_repository['submitted_shift_request'](submitted_shift_entity)
        
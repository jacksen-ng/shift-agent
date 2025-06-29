from ....domain.validation.objects.user_profile import user_profile_validation
from ....domain.entity.crew_info import crew_info_entities
from ...repository.crud.crew_info import crew_info_repository

class EditCrewInfoUseCase:
    def __init__(self, user_id, name, age, phone, position, evaluate, experience, hour_pay, post):
        self.user_id = user_id
        self.name = name
        self.age = age
        self.phone = phone
        self.position = position
        self.evaluate = evaluate
        self.experience = experience
        self.hour_pay = hour_pay
        self.post = post

    def execute(self):
        user_id_validation = user_profile_validation['UserIDValidation'](self.user_id).execute()
        name_validation = user_profile_validation['NameValidation'](self.name).execute()
        age_validation = user_profile_validation['AgeValidation'](self.age).execute()
        phone_validation = user_profile_validation['PhoneValidation'](self.phone).execute()
        position_validation = user_profile_validation['PositionValidation'](self.position).execute()
        evaluate_validation = user_profile_validation['EvaluateValidation'](self.evaluate).execute()
        experience_validation = user_profile_validation['ExperienceValidation'](self.experience).execute()
        hour_pay_validation = user_profile_validation['HourPayValidation'](self.hour_pay).execute()
        post_validation = user_profile_validation['PostValidation'](self.post).execute()

        user_profile_entity = crew_info_entities['CrewInfoEditEntity'](
            user_id_validation,
            name_validation,
            age_validation,
            phone_validation,
            position_validation,
            evaluate_validation,
            experience_validation,
            hour_pay_validation,
            post_validation
        ).to_json()

        crew_info_repository['crew_info_edit_request'](
            user_profile_entity['user_id'],
            user_profile_entity['name'],
            user_profile_entity['age'],
            user_profile_entity['phone'],
            user_profile_entity['position'],
            user_profile_entity['evaluate'],
            user_profile_entity['experience'],
            user_profile_entity['hour_pay'],
            user_profile_entity['post']
        )
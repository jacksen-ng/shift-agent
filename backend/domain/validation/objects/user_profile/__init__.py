import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from user_profile.user_id import UserID
from user_profile.name import Name
from user_profile.age import Age
from user_profile.phone import Phone
from user_profile.position import Position
from user_profile.evaluate import Evaluate
from user_profile.post import Post
from user_profile.experience import Experience
from user_profile.user_profile_id import UserProfileID
from user_profile.company_id import CompanyID
from user_profile.hour_pay import HourPay

UserProfileModels = {
    'UserID': UserID,
    'Name': Name,
    'Age': Age,
    'Phone': Phone,
    'Position': Position,
    'Evaluate': Evaluate,
    'Post': Post,
    'Experience': Experience,
    'UserProfileID': UserProfileID,
    'CompanyID': CompanyID,
    'HourPay': HourPay
}
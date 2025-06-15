import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from login_entity import LoginEntity
from signin_entity import SigninEntity
from token_entity import TokenEntity

auth_entities = {
    "LoginEntity": LoginEntity,
    "SigninEntity": SigninEntity,
    "TokenEntity": TokenEntity
}
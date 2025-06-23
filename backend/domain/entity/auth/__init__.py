import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from auth.login import LoginEntity
from auth.signin import SigninEntity
from auth.token import TokenEntity

auth_entities = {
    "LoginEntity": LoginEntity,
    "SigninEntity": SigninEntity,
    "TokenEntity": TokenEntity
}
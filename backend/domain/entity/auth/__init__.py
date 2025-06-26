from .login import LoginEntity
from .signin import SigninEntity
from .token import TokenEntity

auth_entities = {
    "LoginEntity": LoginEntity,
    "SigninEntity": SigninEntity,
    "TokenEntity": TokenEntity
}
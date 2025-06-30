from .in_atmark import InAtmarkRule
from .literal_evaluate import LiteralEvaluate
from .literal_post import LiteralPost
from .literal_role import LiteralRole
from .not_hyphen import NotHyphen
from .literal_experience import LiteralExperience

rule_models = {
    'InAtmarkRule': InAtmarkRule,
    'LiteralEvaluate': LiteralEvaluate,
    'LiteralPost': LiteralPost,
    'LiteralRole': LiteralRole,
    'NotHyphen': NotHyphen,
    'LiteralExperience': LiteralExperience
}
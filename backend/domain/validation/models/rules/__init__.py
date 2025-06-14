import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from rules.in_atmark import InAtmarkRule
from rules.literal_evaluate import LiteralEvaluate
from rules.literal_post import LiteralPost
from rules.literal_role import LiteralRole
from rules.not_hyphen import NotHyphen
from rules.literal_experience import LiteralExperience

RuleModels = {
    'InAtmarkRule': InAtmarkRule,
    'LiteralEvaluate': LiteralEvaluate,
    'LiteralPost': LiteralPost,
    'LiteralRole': LiteralRole,
    'NotHyphen': NotHyphen,
    'LiteralExperience': LiteralExperience
}
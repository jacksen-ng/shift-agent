from .auth import post_login, post_signin
from .company_info import get_company_info, edit_company_info
from .crew_info import get_crew_info, edit_crew_info
from .crew_shift import post_submit_shift
from .gemini import gemini_create_shift, gemini_evaluate_shift
from .home_page import get_decision_shift
from .owner_shift import get_shift_info, edit_shift, complete_shift

routes = {
    'post_login': post_login,
    'post_signin': post_signin,
    'get_company_info': get_company_info,
    'edit_company_info': edit_company_info,
    'get_crew_info': get_crew_info,
    'edit_crew_info': edit_crew_info,
    'post_submit_shift': post_submit_shift,
    'gemini_create_shift': gemini_create_shift,
    'gemini_evaluate_shift': gemini_evaluate_shift,
    'get_decision_shift': get_decision_shift,
    'get_shift_info': get_shift_info,
    'edit_shift': edit_shift,
    'complete_shift': complete_shift
}
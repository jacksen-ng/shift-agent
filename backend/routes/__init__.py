from .auth import app as auth_router
from .company_info import app as company_info_router
from .crew_info import app as crew_info_router
from .crew_shift import app as crew_shift_router
from .gemini import app as gemini_router
from .home_page import app as home_page_router
from .owner_shift import app as owner_shift_router

__all__ = [
    "auth_router",
    "company_info_router", 
    "crew_info_router",
    "crew_shift_router",
    "gemini_router", 
    "home_page_router",
    "owner_shift_router"
]

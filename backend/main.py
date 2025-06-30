from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import (
    auth_router,
    company_info_router,
    crew_info_router,
    crew_shift_router,
    gemini_router,
    home_page_router,
    owner_shift_router
)

app = FastAPI()

origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(company_info_router)
app.include_router(crew_info_router)
app.include_router(crew_shift_router)
app.include_router(gemini_router)
app.include_router(home_page_router)
app.include_router(owner_shift_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Shift Agent API"}

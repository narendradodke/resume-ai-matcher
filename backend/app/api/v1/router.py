from fastapi import APIRouter
from backend.app.api.v1.endpoints import auth, resume, analysis

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(resume.router)
api_router.include_router(analysis.router)

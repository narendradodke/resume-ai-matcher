from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AnalysisCreate(BaseModel):
    resume_id: UUID
    job_description: str = Field(..., min_length=20, max_length=15000)


class AnalysisResponse(BaseModel):
    id: UUID
    user_id: UUID
    resume_id: UUID
    job_description: str
    match_score: Optional[int] = None
    missing_keywords: Optional[List[str]] = None
    suggestions: Optional[str] = None
    engine_used: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnalysisHistoryItem(BaseModel):
    id: UUID
    resume_id: UUID
    match_score: Optional[int] = None
    engine_used: Optional[str] = None
    status: str
    created_at: datetime
    job_title_snippet: str

    model_config = ConfigDict(from_attributes=True)


class PaginatedAnalyses(BaseModel):
    items: List[AnalysisResponse]
    total: int
    page: int
    limit: int
    total_pages: int

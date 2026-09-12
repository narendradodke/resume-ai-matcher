from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ResumeBase(BaseModel):
    file_url: str


class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    file_url: str
    extracted_text: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeSummary(BaseModel):
    id: UUID
    user_id: UUID
    file_url: str
    uploaded_at: datetime
    text_preview: str

    model_config = ConfigDict(from_attributes=True)

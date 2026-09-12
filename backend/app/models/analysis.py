import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import Integer, Text, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from backend.app.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    resume_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_description: Mapped[str] = mapped_column(Text, nullable=False)
    match_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    missing_keywords: Mapped[Optional[List[str]]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
        default=list,
    )
    suggestions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    engine_used: Mapped[Optional[str]] = mapped_column(String(50), default="ai", nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="completed", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")

    def __repr__(self) -> str:
        return f"<Analysis id={self.id} score={self.match_score} status={self.status}>"

import math
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.resume import Resume
from backend.app.models.analysis import Analysis
from backend.app.api.deps import get_current_user
from backend.app.schemas.user_schema import ResponseEnvelope
from backend.app.schemas.analysis_schema import (
    AnalysisCreate,
    AnalysisResponse,
    PaginatedAnalyses,
)
from backend.app.core.celery_worker import process_analysis_task

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/run", response_model=ResponseEnvelope[AnalysisResponse], status_code=status.HTTP_202_ACCEPTED)
def run_analysis(
    analysis_in: AnalysisCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Trigger AI analysis between an uploaded resume and a job description.
    Runs asynchronously via Celery background task.
    """
    resume = (
        db.query(Resume)
        .filter(Resume.id == analysis_in.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or does not belong to the authenticated user.",
        )

    analysis = Analysis(
        user_id=current_user.id,
        resume_id=resume.id,
        job_description=analysis_in.job_description,
        status="pending",
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    try:
        process_analysis_task.delay(str(analysis.id))
    except Exception:
        try:
            process_analysis_task(str(analysis.id))
            db.refresh(analysis)
        except Exception:
            pass

    db.refresh(analysis)
    return {
        "success": True,
        "data": AnalysisResponse.model_validate(analysis),
        "error": None,
    }


@router.get("/history", response_model=ResponseEnvelope[PaginatedAnalyses])
def get_analysis_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all past analyses conducted by the current user with pagination.
    """
    query = db.query(Analysis).filter(Analysis.user_id == current_user.id)
    total = query.count()
    offset = (page - 1) * limit
    analyses = (
        query.order_by(Analysis.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "success": True,
        "data": PaginatedAnalyses(
            items=[AnalysisResponse.model_validate(a) for a in analyses],
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        ),
        "error": None,
    }


@router.get("/{id}", response_model=ResponseEnvelope[AnalysisResponse])
def get_analysis(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve details and score breakdown of a single analysis.
    """
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )

    return {
        "success": True,
        "data": AnalysisResponse.model_validate(analysis),
        "error": None,
    }

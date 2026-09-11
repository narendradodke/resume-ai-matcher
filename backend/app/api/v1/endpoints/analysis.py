from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.resume import Resume
from backend.app.models.analysis import Analysis
from backend.app.api.deps import get_current_user
from backend.app.schemas.user_schema import ResponseEnvelope
from backend.app.schemas.analysis_schema import AnalysisCreate, AnalysisResponse
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
    # 1. Verify resume exists and belongs to current user
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

    # 2. Create pending analysis entry in database
    analysis = Analysis(
        user_id=current_user.id,
        resume_id=resume.id,
        job_description=analysis_in.job_description,
        status="pending",
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # 3. Trigger Celery worker (or fallback to sync execution if broker unavailable)
    try:
        process_analysis_task.delay(str(analysis.id))
    except Exception:
        # Fallback to direct synchronous processing if Celery broker is offline
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

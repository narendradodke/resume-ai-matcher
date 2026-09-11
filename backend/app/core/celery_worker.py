from uuid import UUID
from celery import Celery
from backend.app.config import settings

celery_app = Celery(
    "resume_matcher_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240,
    result_expires=86400,
)


@celery_app.task(name="process_analysis_task")
def process_analysis_task(analysis_id: str):
    """
    Background worker task to execute AI resume-job matching
    and persist results to PostgreSQL.
    """
    from backend.app.database import SessionLocal
    from backend.app.models.analysis import Analysis
    from backend.app.models.resume import Resume
    from backend.app.core.ai_engine import analyze_resume_against_job

    db = SessionLocal()
    try:
        analysis = db.query(Analysis).filter(Analysis.id == UUID(analysis_id)).first()
        if not analysis:
            return

        analysis.status = "processing"
        db.commit()

        resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
        if not resume:
            analysis.status = "failed"
            db.commit()
            return

        ai_result = analyze_resume_against_job(resume.extracted_text, analysis.job_description)

        analysis.match_score = ai_result.get("match_score", 0)
        analysis.missing_keywords = ai_result.get("missing_keywords", [])
        analysis.suggestions = ai_result.get("suggestions", "")
        analysis.status = "completed"
        db.commit()
    except Exception as e:
        db.rollback()
        try:
            analysis = db.query(Analysis).filter(Analysis.id == UUID(analysis_id)).first()
            if analysis:
                analysis.status = "failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()

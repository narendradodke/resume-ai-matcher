import logging
from uuid import UUID
from celery import Celery
from backend.app.config import settings

logger = logging.getLogger(__name__)

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
    broker_connection_retry_on_startup=False,
    broker_connection_max_retries=0,
)


@celery_app.task(
    name="process_analysis_task",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
    max_retries=3,
)
def process_analysis_task(self, analysis_id: str):
    """
    Background worker task to execute AI resume-job matching
    and persist results to PostgreSQL with exponential backoff retries.
    """
    from backend.app.database import SessionLocal
    from backend.app.models.analysis import Analysis
    from backend.app.models.resume import Resume
    from backend.app.core.ai_engine import analyze_resume_against_job

    db = SessionLocal()
    try:
        analysis = db.query(Analysis).filter(Analysis.id == UUID(analysis_id)).first()
        if not analysis:
            logger.warning("Analysis record not found for id=%s", analysis_id)
            return

        analysis.status = "processing"
        db.commit()

        resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
        if not resume:
            logger.error("Resume record %s not found for analysis %s", analysis.resume_id, analysis_id)
            analysis.status = "failed"
            db.commit()
            return

        ai_result = analyze_resume_against_job(resume.extracted_text, analysis.job_description)

        analysis.match_score = ai_result.get("match_score", 0)
        analysis.missing_keywords = ai_result.get("missing_keywords", [])
        analysis.suggestions = ai_result.get("suggestions", "")
        analysis.status = "completed"
        db.commit()
        logger.info("Successfully completed analysis id=%s with score=%s", analysis_id, analysis.match_score)
    except Exception as e:
        db.rollback()
        logger.exception("Error executing analysis id=%s (attempt %s/%s): %s", analysis_id, self.request.retries, self.max_retries, e)
        # If this is the final retry attempt, mark status as failed in DB
        if self.request.retries >= self.max_retries:
            try:
                analysis = db.query(Analysis).filter(Analysis.id == UUID(analysis_id)).first()
                if analysis:
                    analysis.status = "failed"
                    db.commit()
            except Exception as dbe:
                logger.error("Failed to update analysis status to failed: %s", dbe)
        raise e
    finally:
        db.close()

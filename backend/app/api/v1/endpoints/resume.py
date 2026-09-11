import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.resume import Resume
from backend.app.api.deps import get_current_user
from backend.app.core.pdf_parser import extract_text_from_pdf
from backend.app.schemas.user_schema import ResponseEnvelope
from backend.app.schemas.resume_schema import ResumeResponse

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload", response_model=ResponseEnvelope[ResumeResponse], status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a resume in PDF format, extract its text content, and store it.
    """
    # 1. Validate file extension
    filename = file.filename or "resume.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF files are supported.",
        )

    # 2. Read contents and validate size
    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum allowed size is {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # 3. Extract text from PDF
    try:
        extracted_text = extract_text_from_pdf(content)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF resume: {str(e)}",
        )

    # 4. Save file to disk
    user_upload_dir = Path(settings.UPLOAD_DIR) / str(current_user.id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)
    saved_filename = f"{uuid.uuid4().hex}_{Path(filename).name}"
    file_path = user_upload_dir / saved_filename
    with open(file_path, "wb") as f:
        f.write(content)

    # 5. Save resume record in DB
    resume = Resume(
        user_id=current_user.id,
        file_url=str(file_path.as_posix()),
        extracted_text=extracted_text,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "success": True,
        "data": ResumeResponse.model_validate(resume),
        "error": None,
    }

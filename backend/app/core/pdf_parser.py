import io
import re
from typing import Union
import pdfplumber
from pypdf import PdfReader


def clean_extracted_text(text: str) -> str:
    """Normalize extracted whitespace and remove unwanted characters."""
    if not text:
        return ""
    # Replace multiple spaces with single space
    cleaned = re.sub(r"[ \t]+", " ", text)
    # Replace more than two consecutive newlines with two newlines
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def extract_text_from_pdf(pdf_source: Union[bytes, io.BytesIO, str]) -> str:
    """
    Extract text content from a PDF file (bytes, file-like object, or file path).
    Attempts extraction using pdfplumber first, with fallback to pypdf.
    """
    text_parts = []

    # Attempt 1: pdfplumber (best for layout and text flow)
    try:
        if isinstance(pdf_source, bytes):
            stream = io.BytesIO(pdf_source)
            with pdfplumber.open(stream) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        elif isinstance(pdf_source, io.BytesIO):
            pdf_source.seek(0)
            with pdfplumber.open(pdf_source) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        elif isinstance(pdf_source, str):
            with pdfplumber.open(pdf_source) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
    except Exception:
        # Fallback to pypdf if pdfplumber encounters an error
        text_parts = []

    extracted_text = "\n\n".join(text_parts).strip()

    # Attempt 2: pypdf fallback if empty or failed
    if not extracted_text:
        try:
            if isinstance(pdf_source, bytes):
                reader = PdfReader(io.BytesIO(pdf_source))
            elif isinstance(pdf_source, io.BytesIO):
                pdf_source.seek(0)
                reader = PdfReader(pdf_source)
            else:
                reader = PdfReader(pdf_source)

            fallback_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    fallback_parts.append(page_text)
            extracted_text = "\n\n".join(fallback_parts).strip()
        except Exception as e:
            raise ValueError(f"Failed to parse PDF file: {str(e)}")

    if not extracted_text:
        raise ValueError(
            "Could not extract readable text from the uploaded PDF. "
            "Please ensure the file is not empty or scanned as an image."
        )

    return clean_extracted_text(extracted_text)

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


def validate_pdf_magic_bytes(data: bytes) -> bool:
    """Verify that file data begins with the valid PDF magic byte signature."""
    return data.startswith(b"%PDF-")


def extract_text_from_pdf(pdf_source: Union[bytes, io.BytesIO, str], max_pages: int = 20) -> str:
    """
    Extract text content from a PDF file (bytes, file-like object, or file path).
    Validates magic bytes when bytes are provided and enforces a max page count.
    Attempts extraction using pdfplumber first, with fallback to pypdf.
    """
    if isinstance(pdf_source, bytes):
        if not validate_pdf_magic_bytes(pdf_source):
            raise ValueError("Invalid PDF format: Missing %PDF- signature.")

    text_parts = []

    # Attempt 1: pdfplumber (best for layout and text flow)
    try:
        if isinstance(pdf_source, bytes):
            stream = io.BytesIO(pdf_source)
            with pdfplumber.open(stream) as pdf:
                if len(pdf.pages) > max_pages:
                    raise ValueError(f"PDF exceeds maximum allowed page count of {max_pages} pages.")
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        elif isinstance(pdf_source, io.BytesIO):
            pdf_source.seek(0)
            with pdfplumber.open(pdf_source) as pdf:
                if len(pdf.pages) > max_pages:
                    raise ValueError(f"PDF exceeds maximum allowed page count of {max_pages} pages.")
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        elif isinstance(pdf_source, str):
            with pdfplumber.open(pdf_source) as pdf:
                if len(pdf.pages) > max_pages:
                    raise ValueError(f"PDF exceeds maximum allowed page count of {max_pages} pages.")
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
    except ValueError as ve:
        raise ve
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

            if len(reader.pages) > max_pages:
                raise ValueError(f"PDF exceeds maximum allowed page count of {max_pages} pages.")

            fallback_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    fallback_parts.append(page_text)
            extracted_text = "\n\n".join(fallback_parts).strip()
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise ValueError(f"Failed to parse PDF file: {str(e)}")

    if not extracted_text:
        raise ValueError(
            "Could not extract readable text from the uploaded PDF. "
            "Please ensure the file is not empty or scanned as an image."
        )

    return clean_extracted_text(extracted_text)

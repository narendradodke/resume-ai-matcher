import io
import pytest

VALID_PDF_BYTES = (
    b"%PDF-1.4\n"
    b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
    b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
    b"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
    b"4 0 obj <</Length 55>> stream\n"
    b"BT /F1 12 Tf 100 700 Td (John Doe Software Engineer Python FastAPI) Tj ET\n"
    b"endstream endobj\n"
    b"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
    b"xref\n"
    b"0 6\n"
    b"0000000000 65535 f \n"
    b"0000000010 00000 n \n"
    b"0000000060 00000 n \n"
    b"0000000117 00000 n \n"
    b"0000000244 00000 n \n"
    b"0000000350 00000 n \n"
    b"trailer <</Size 6 /Root 1 0 R>>\n"
    b"startxref\n"
    b"420\n"
    b"%%EOF\n"
)


def get_auth_header(client, email="resumeuser@example.com", name="Resume User"):
    client.post(
        "/api/v1/auth/signup",
        json={"name": name, "email": email, "password": "password123"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    token = login_res.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_upload_resume_success(client):
    headers = get_auth_header(client)
    files = {
        "file": ("my_resume.pdf", io.BytesIO(VALID_PDF_BYTES), "application/pdf")
    }
    response = client.post("/api/v1/resume/upload", headers=headers, files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "John Doe" in data["data"]["extracted_text"]
    assert "id" in data["data"]


def test_upload_resume_invalid_extension(client):
    headers = get_auth_header(client, email="invalid@example.com")
    files = {
        "file": ("not_a_pdf.txt", io.BytesIO(b"Hello plain text"), "text/plain")
    }
    response = client.post("/api/v1/resume/upload", headers=headers, files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Only PDF files are supported" in data["error"]


def test_list_and_get_resumes(client):
    headers = get_auth_header(client, email="lister@example.com")
    files = {
        "file": ("cv.pdf", io.BytesIO(VALID_PDF_BYTES), "application/pdf")
    }
    upload_res = client.post("/api/v1/resume/upload", headers=headers, files=files)
    resume_id = upload_res.json()["data"]["id"]

    # List
    list_res = client.get("/api/v1/resume/list", headers=headers)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["success"] is True
    assert len(list_data["data"]) == 1
    assert list_data["data"][0]["id"] == resume_id

    # Get by ID
    get_res = client.get(f"/api/v1/resume/{resume_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == resume_id


def test_delete_resume(client):
    headers = get_auth_header(client, email="deleter@example.com")
    files = {
        "file": ("delete_me.pdf", io.BytesIO(VALID_PDF_BYTES), "application/pdf")
    }
    upload_res = client.post("/api/v1/resume/upload", headers=headers, files=files)
    resume_id = upload_res.json()["data"]["id"]

    # Delete
    del_res = client.delete(f"/api/v1/resume/{resume_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Confirm 404
    get_res = client.get(f"/api/v1/resume/{resume_id}", headers=headers)
    assert get_res.status_code == 404


def test_resume_user_isolation(client):
    headers_a = get_auth_header(client, email="user_a@example.com")
    headers_b = get_auth_header(client, email="user_b@example.com")

    # User A uploads
    files = {
        "file": ("user_a.pdf", io.BytesIO(VALID_PDF_BYTES), "application/pdf")
    }
    upload_res = client.post("/api/v1/resume/upload", headers=headers_a, files=files)
    resume_a_id = upload_res.json()["data"]["id"]

    # User B tries to fetch User A's resume -> 404
    get_res = client.get(f"/api/v1/resume/{resume_a_id}", headers=headers_b)
    assert get_res.status_code == 404

    # User B tries to delete User A's resume -> 404
    del_res = client.delete(f"/api/v1/resume/{resume_a_id}", headers=headers_b)
    assert del_res.status_code == 404


def test_upload_invalid_magic_bytes(client):
    headers = get_auth_header(client, email="fake_magic@example.com")
    # File named .pdf but containing plain text without %PDF- magic bytes
    files = {
        "file": ("fake.pdf", io.BytesIO(b"This is not a real PDF file."), "application/pdf")
    }
    response = client.post("/api/v1/resume/upload", headers=headers, files=files)
    assert response.status_code == 400
    assert "Invalid PDF content" in response.json()["error"]


def test_upload_path_traversal_sanitization(client):
    headers = get_auth_header(client, email="traversal@example.com")
    # File with directory traversal characters in filename
    files = {
        "file": ("../../etc/passwd.pdf", io.BytesIO(VALID_PDF_BYTES), "application/pdf")
    }
    response = client.post("/api/v1/resume/upload", headers=headers, files=files)
    assert response.status_code == 201
    # Check that the file was safely saved and didn't escape to ../../
    saved_url = response.json()["data"]["file_url"]
    assert ".." not in saved_url

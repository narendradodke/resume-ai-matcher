def test_signup_success(client):
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "strongpassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "Jane Doe"
    assert data["data"]["email"] == "jane@example.com"
    assert data["data"]["plan"] == "free"
    assert "password" not in data["data"]


def test_signup_duplicate_email(client):
    payload = {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "securepassword123",
    }
    first_res = client.post("/api/v1/auth/signup", json=payload)
    assert first_res.status_code == 201

    dup_res = client.post("/api/v1/auth/signup", json=payload)
    assert dup_res.status_code == 400
    data = dup_res.json()
    assert data["success"] is False
    assert "already exists" in data["error"]


def test_signup_validation_failure(client):
    # Missing required field and short password
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "notanemail", "password": "123"},
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False

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
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "notanemail", "password": "123"},
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_login_success(client):
    signup_res = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Alice Smith",
            "email": "alice@example.com",
            "password": "mypassword123",
        },
    )
    assert signup_res.status_code == 201

    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "alice@example.com",
            "password": "mypassword123",
        },
    )
    assert login_res.status_code == 200
    data = login_res.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"
    assert data["data"]["user"]["email"] == "alice@example.com"


def test_login_invalid_credentials(client):
    res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword",
        },
    )
    assert res.status_code == 401
    data = res.json()
    assert data["success"] is False
    assert "Invalid email or password" in data["error"]


def test_refresh_token_success(client):
    client.post(
        "/api/v1/auth/signup",
        json={"name": "Refresh User", "email": "ref@example.com", "password": "password123"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "ref@example.com", "password": "password123"},
    )
    refresh_token = login_res.json()["data"]["refresh_token"]

    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"


def test_refresh_token_invalid(client):
    res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalid.jwt.token"},
    )
    assert res.status_code == 401
    data = res.json()
    assert data["success"] is False


def test_get_me_success(client):
    # Signup & Login
    client.post(
        "/api/v1/auth/signup",
        json={"name": "Auth Me User", "email": "me@example.com", "password": "password123"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "me@example.com", "password": "password123"},
    )
    access_token = login_res.json()["data"]["access_token"]

    # Call GET /me with Bearer token
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    data = me_res.json()
    assert data["success"] is True
    assert data["data"]["email"] == "me@example.com"
    assert data["data"]["name"] == "Auth Me User"


def test_get_me_unauthorized(client):
    # No auth header
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401

    # Invalid token
    res_bad = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer bad-token"},
    )
    assert res_bad.status_code == 401

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


from unittest.mock import patch


def test_google_auth_flow(client):
    mock_idinfo = {
        "iss": "https://accounts.google.com",
        "sub": "google_uid_98765",
        "email": "googleuser@example.com",
        "email_verified": True,
        "name": "Google Tester",
    }
    with patch("backend.app.api.v1.endpoints.auth.verify_google_id_token", return_value=mock_idinfo):
        # 1. Sign up/in via verified Google OAuth token
        res = client.post(
            "/api/v1/auth/google",
            json={"id_token": "valid_signed_google_id_token"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert data["data"]["user"]["email"] == "googleuser@example.com"
        assert data["data"]["user"]["is_verified"] is True

        # 2. Re-login with existing verified Google user
        res_relogin = client.post(
            "/api/v1/auth/google",
            json={"id_token": "valid_signed_google_id_token"},
        )
        assert res_relogin.status_code == 200
        assert "access_token" in res_relogin.json()["data"]


def test_google_auth_invalid_token(client):
    with patch("backend.app.api.v1.endpoints.auth.verify_google_id_token", side_effect=ValueError("Invalid signature or expired token")):
        res = client.post("/api/v1/auth/google", json={"id_token": "bad_token_value_12345"})
        assert res.status_code == 401
        assert res.json()["success"] is False
        assert "Invalid signature" in res.json()["error"]


def test_google_auth_safe_linking_with_password_user(client):
    # User signs up with email and password first
    client.post(
        "/api/v1/auth/signup",
        json={"name": "Existing User", "email": "linkme@example.com", "password": "password123"},
    )

    mock_idinfo = {
        "iss": "https://accounts.google.com",
        "sub": "google_uid_55555",
        "email": "linkme@example.com",
        "email_verified": True,
        "name": "Existing User",
    }
    with patch("backend.app.api.v1.endpoints.auth.verify_google_id_token", return_value=mock_idinfo):
        # Now logs in with verified Google OAuth for same email
        res = client.post("/api/v1/auth/google", json={"id_token": "valid_link_token_12345"})
        assert res.status_code == 200
        assert res.json()["success"] is True
        assert res.json()["data"]["user"]["email"] == "linkme@example.com"


def test_google_auth_subject_mismatch(client):
    mock_user_a = {
        "iss": "https://accounts.google.com",
        "sub": "google_uid_original",
        "email": "mismatch@example.com",
        "email_verified": True,
        "name": "Mismatch Tester",
    }
    mock_user_b = {
        "iss": "https://accounts.google.com",
        "sub": "google_uid_attacker_different",
        "email": "mismatch@example.com",
        "email_verified": True,
        "name": "Mismatch Tester",
    }
    with patch("backend.app.api.v1.endpoints.auth.verify_google_id_token", return_value=mock_user_a):
        res1 = client.post("/api/v1/auth/google", json={"id_token": "token_original_12345"})
        assert res1.status_code == 200

    with patch("backend.app.api.v1.endpoints.auth.verify_google_id_token", return_value=mock_user_b):
        res2 = client.post("/api/v1/auth/google", json={"id_token": "token_diff_12345"})
        assert res2.status_code == 403
        assert "Google account mismatch" in res2.json()["error"]

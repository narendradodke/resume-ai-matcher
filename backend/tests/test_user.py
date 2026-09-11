from backend.tests.test_analysis import get_auth_header, upload_sample_resume


def test_user_profile_update(client):
    headers = get_auth_header(client, email="profile_update@example.com")

    # Update name
    update_res = client.put(
        "/api/v1/user/profile",
        headers=headers,
        json={"name": "Updated Name"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["name"] == "Updated Name"


def test_user_account_delete_cascade(client):
    headers = get_auth_header(client, email="cascade_del@example.com")
    resume_id = upload_sample_resume(client, headers)

    # Delete account
    del_res = client.delete("/api/v1/user/account", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Subsequent access fails with 401
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 401


def test_user_change_password_success(client):
    headers = get_auth_header(client, email="pw_change@example.com")

    # Change password
    res = client.put(
        "/api/v1/user/password",
        headers=headers,
        json={"current_password": "password123", "new_password": "brandnewpassword456"},
    )
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Confirm old password fails
    old_login = client.post(
        "/api/v1/auth/login",
        json={"email": "pw_change@example.com", "password": "password123"},
    )
    assert old_login.status_code == 401

    # Confirm new password succeeds
    new_login = client.post(
        "/api/v1/auth/login",
        json={"email": "pw_change@example.com", "password": "brandnewpassword456"},
    )
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()["data"]


def test_user_change_password_invalid_current(client):
    headers = get_auth_header(client, email="pw_fail@example.com")

    # Provide incorrect current password
    res = client.put(
        "/api/v1/user/password",
        headers=headers,
        json={"current_password": "incorrect_password", "new_password": "brandnewpassword456"},
    )
    assert res.status_code == 400
    assert res.json()["success"] is False
    assert "verification failed" in res.json()["error"]


def test_production_jwt_secret_enforcement():
    import pytest
    from backend.app.config import Settings

    # 1. Production + default secret => ValueError
    with pytest.raises(ValueError, match="FATAL: Insecure, missing, or default JWT_SECRET_KEY"):
        Settings(
            ENVIRONMENT="production",
            JWT_SECRET_KEY="supersecretjwtkey_change_in_production_min32chars_long!",
        )

    # 2. Production + short secret (<32 chars) => ValueError
    with pytest.raises(ValueError, match="FATAL: Insecure, missing, or default JWT_SECRET_KEY"):
        Settings(
            ENVIRONMENT="production",
            JWT_SECRET_KEY="short_secret_under_32_chars!",
        )

    # 3. Production + wildcard CORS => ValueError
    with pytest.raises(ValueError, match="FATAL: Wildcard"):
        Settings(
            ENVIRONMENT="production",
            JWT_SECRET_KEY="a_very_secure_random_production_secret_key_32_chars_long!",
            ALLOWED_ORIGINS=["*"],
        )

    # 4. Production + valid secure key + explicit origins => success
    valid_settings = Settings(
        ENVIRONMENT="production",
        JWT_SECRET_KEY="a_very_secure_random_production_secret_key_32_chars_long!",
        ALLOWED_ORIGINS=["https://example.com"],
    )
    assert valid_settings.ENVIRONMENT == "production"
    assert len(valid_settings.JWT_SECRET_KEY) >= 32

    # 5. Development environment allows dev secret => success
    dev_settings = Settings(
        ENVIRONMENT="development",
        JWT_SECRET_KEY="dev_secret_key",
    )
    assert dev_settings.ENVIRONMENT == "development"

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

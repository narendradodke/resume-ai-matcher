import pytest
from backend.app.config import Settings


def test_cors_preflight_allowed_origin(client):
    """Preflight OPTIONS request from configured origin must return CORS headers."""
    response = client.options(
        "/api/v1/auth/signup",
        headers={
            "Origin": "https://resume-ai-matcher.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://resume-ai-matcher.vercel.app"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_preflight_disallowed_origin(client):
    """Preflight request from unknown/untrusted origin must not receive allow-origin."""
    response = client.options(
        "/api/v1/auth/signup",
        headers={
            "Origin": "https://unauthorized-attacker.example.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.headers.get("access-control-allow-origin") is None


def test_cors_get_with_allowed_origin(client):
    """GET request from allowed origin returns correct access-control header."""
    response = client.get(
        "/health",
        headers={"Origin": "https://ai-resume-matcher-app.vercel.app"},
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://ai-resume-matcher-app.vercel.app"


def test_settings_cors_parsing_comma_separated():
    """Settings must cleanly parse comma-separated strings and strip trailing slashes."""
    s = Settings(
        ALLOWED_ORIGINS="https://app1.vercel.app/, https://app2.vercel.app",
        ENVIRONMENT="development",
    )
    assert "https://app1.vercel.app" in s.ALLOWED_ORIGINS
    assert "https://app2.vercel.app" in s.ALLOWED_ORIGINS
    assert not any(origin.endswith("/") for origin in s.ALLOWED_ORIGINS)


def test_settings_cors_parsing_json_list():
    """Settings must parse JSON array string and strip trailing slashes."""
    s = Settings(
        ALLOWED_ORIGINS='["https://example1.com/", "https://example2.com"]',
        ENVIRONMENT="development",
    )
    assert s.ALLOWED_ORIGINS == ["https://example1.com", "https://example2.com"]


def test_settings_rejects_wildcard_in_production():
    """Production mode must reject wildcard '*' in ALLOWED_ORIGINS."""
    with pytest.raises(ValueError, match="Wildcard"):
        Settings(
            ENVIRONMENT="production",
            JWT_SECRET_KEY="super_secure_production_secret_key_exceeding_32_chars!",
            ALLOWED_ORIGINS=["*"],
        )

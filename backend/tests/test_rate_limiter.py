import logging
from unittest.mock import patch
import redis
from backend.app.core.rate_limiter import check_rate_limit
import backend.app.core.rate_limiter as rl_module


def test_rate_limiter_in_memory_fallback_warning(caplog):
    # Reset warning logged flag for isolated test
    rl_module._in_memory_warning_logged = False

    # Simulate Redis being completely unreachable
    with patch("redis.Redis.from_url") as mock_from_url:
        mock_from_url.side_effect = redis.ConnectionError("Could not connect to Redis at localhost:6379")

        with caplog.at_level(logging.WARNING):
            # Call rate limiter with unique user
            check_rate_limit(user_id="test_redis_unreachable_user", limit=5, window_seconds=60)

        # Assert warning log fired with clear degradation message
        warning_records = [
            r for r in caplog.records
            if r.levelno == logging.WARNING and "Falling back to non-distributed in-memory rate limiting" in r.message
        ]
        assert len(warning_records) >= 1, "Expected degraded in-memory rate limiting warning to be logged"
        assert "NOT safe for multi-instance deployments" in warning_records[0].message

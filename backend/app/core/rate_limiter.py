import time
from typing import Dict, List
import redis
from fastapi import HTTPException, status
from backend.app.config import settings
from backend.app.utils.logger import logger

# Flag to emit degraded in-memory warning once per process
_in_memory_warning_logged: bool = False

# In-memory fallback tracking {user_id: [timestamps]}
_memory_rate_limits: Dict[str, List[float]] = {}


def check_rate_limit(user_id: str, limit: int = None, window_seconds: int = 60) -> None:
    """
    Enforce rate limiting per user.
    Uses Redis as the primary distributed mechanism with an in-memory sliding-window fallback.
    """
    global _in_memory_warning_logged

    if limit is None:
        limit = settings.RATE_LIMIT_ANALYSIS_PER_MINUTE

    # 1. Attempt Redis rate limiting (distributed, multi-instance safe)
    try:
        r = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=0.5)
        key = f"rate_limit:analysis:{user_id}:{int(time.time() // window_seconds)}"
        current_count = r.incr(key)
        if current_count == 1:
            r.expire(key, window_seconds + 5)
        if current_count > limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {limit} requests per minute.",
            )
        return
    except (redis.RedisError, ConnectionError, OSError):
        # Fall back to in-memory sliding window
        pass

    # Warn loudly once per process that rate limiting is operating in degraded single-instance mode
    if not _in_memory_warning_logged:
        logger.warning(
            "Redis rate limiter is unreachable at %s. Falling back to non-distributed in-memory rate limiting. "
            "WARNING: The in-memory fallback is process-local and is NOT safe for multi-instance deployments, "
            "multiple Uvicorn workers, or container replicas. Redis must be available in any production or scaled environment.",
            settings.REDIS_URL,
        )
        _in_memory_warning_logged = True

    # 2. In-memory sliding window fallback (single-instance only)
    now = time.time()
    cutoff = now - window_seconds
    timestamps = _memory_rate_limits.get(user_id, [])
    # Prune old timestamps
    valid_timestamps = [t for t in timestamps if t > cutoff]

    if len(valid_timestamps) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {limit} requests per minute.",
        )

    valid_timestamps.append(now)
    _memory_rate_limits[user_id] = valid_timestamps

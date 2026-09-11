import time
from typing import Dict, List
import redis
from fastapi import HTTPException, status
from backend.app.config import settings

# In-memory fallback tracking {user_id: [timestamps]}
_memory_rate_limits: Dict[str, List[float]] = {}


def check_rate_limit(user_id: str, limit: int = None, window_seconds: int = 60) -> None:
    """
    Enforce rate limiting per user.
    Uses Redis when available, with in-memory sliding-window fallback.
    """
    if limit is None:
        limit = settings.RATE_LIMIT_ANALYSIS_PER_MINUTE

    # 1. Attempt Redis rate limiting
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

    # 2. In-memory sliding window fallback
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

import hashlib
from fastapi import Depends, Header, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.database import get_db
from src.models import Session, User


def digest(value: str) -> str:
    """Peppered hash for codes and session tokens; only hashes ever reach the database."""
    return hashlib.sha256(f"{settings.secret}:{value}".encode()).hexdigest()


async def current_user_optional(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    return await db.scalar(
        select(User).join(Session, Session.user_id == User.id)
        .where(Session.token_hash == digest(authorization.removeprefix("Bearer ")), Session.expires_at > func.now())
    )


async def get_current_user(user: User | None = Depends(current_user_optional)) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Sign in with your school email")
    return user

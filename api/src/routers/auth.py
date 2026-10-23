import hmac
import random
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Literal
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.auth import digest, get_current_user
from src.core.config import settings
from src.core.database import get_db
from src.models import EmailCode, SchoolRequest, Session, User
from src.services.mail import code_email, send_mail
from src.services.schools import email_domain, school_for_email

router = APIRouter(prefix="/auth", tags=["auth"])

EMAIL = re.compile(r"^[^@\s]+@[a-z0-9-]+(\.[a-z0-9-]+)+$")

# ── Schemas ───────────────────────────────────────────────────────────────────

class EmailRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        v = v.strip().lower()
        if len(v) > 254 or not EMAIL.match(v):
            raise ValueError("That does not look like an email")
        return v


class StartOut(BaseModel):
    status: Literal["code_sent", "unknown_school"]
    school: str | None = None
    domain: str


class VerifyRequest(EmailRequest):
    code: str


class SessionOut(BaseModel):
    token: str
    expires_at: datetime

# ── Helpers ───────────────────────────────────────────────────────────────────

async def _new_user(db: AsyncSession, email: str, school_id: int) -> User:
    local = email.split("@")[0]
    base = re.sub(r"[^a-z0-9._]", "", local)[:24] or "student"
    handle = base
    while await db.scalar(select(User.id).where(User.handle == handle)):
        handle = f"{base[:20]}{secrets.randbelow(10_000)}"
    name = " ".join(w.capitalize() for w in re.split(r"[._\-+]+", local) if w)[:80] or handle
    user = User(email=email, school_id=school_id, handle=handle, name=name,
                hue=random.randrange(360), balance=settings.starting_balance)
    db.add(user)
    await db.flush()
    return user

# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/start", response_model=StartOut)
async def start(body: EmailRequest, db: AsyncSession = Depends(get_db)):
    """Send a one-time code to a school email; unknown domains join the demand list instead."""
    school = await school_for_email(db, body.email)
    domain = email_domain(body.email)
    if school is None:
        if not await db.scalar(select(SchoolRequest.id).where(SchoolRequest.email == body.email)):
            db.add(SchoolRequest(email=body.email, domain=domain))
            await db.commit()
        return StartOut(status="unknown_school", domain=domain)

    now = datetime.now(timezone.utc)
    last = await db.scalar(
        select(EmailCode.created_at).where(EmailCode.email == body.email).order_by(EmailCode.created_at.desc()).limit(1)
    )
    if last and now - last < timedelta(seconds=settings.code_resend_seconds):
        raise HTTPException(status_code=429, detail="Code just sent. Check your inbox or try again in a minute")

    code = f"{secrets.randbelow(1_000_000):06d}"
    db.add(EmailCode(email=body.email, code_hash=digest(f"{body.email}:{code}"),
                     expires_at=now + timedelta(minutes=settings.code_minutes)))
    await db.commit()
    try:
        await send_mail(body.email, *code_email(code, school.name))
    except OSError:
        # the code never left; drop it so the student can ask again right away
        await db.execute(delete(EmailCode).where(EmailCode.email == body.email))
        await db.commit()
        raise HTTPException(status_code=503, detail="Could not send the email. Try again in a moment")
    return StartOut(status="code_sent", school=school.name, domain=domain)


@router.post("/verify", response_model=SessionOut)
async def verify(body: VerifyRequest, db: AsyncSession = Depends(get_db)):
    entry = await db.scalar(
        select(EmailCode).where(EmailCode.email == body.email).order_by(EmailCode.created_at.desc())
        .limit(1).with_for_update()
    )
    if entry is None or entry.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Code expired. Ask for a new one")
    if entry.attempts >= settings.code_attempts:
        raise HTTPException(status_code=429, detail="Too many tries. Ask for a new code")
    if not hmac.compare_digest(entry.code_hash, digest(f"{body.email}:{body.code.strip()}")):
        entry.attempts += 1
        await db.commit()
        raise HTTPException(status_code=400, detail="Wrong code")

    await db.execute(delete(EmailCode).where(EmailCode.email == body.email))  # one use only
    user = await db.scalar(select(User).where(User.email == body.email))
    if user is None:
        school = await school_for_email(db, body.email)
        if school is None:
            raise HTTPException(status_code=400, detail="We do not know this school yet")
        user = await _new_user(db, body.email, school.id)
    user.verified_at = datetime.now(timezone.utc)

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(days=settings.session_days)
    db.add(Session(user_id=user.id, token_hash=digest(token), expires_at=expires))
    await db.commit()
    return SessionOut(token=token, expires_at=expires)


@router.post("/logout", status_code=204)
async def logout(
    authorization: str = Header(),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await db.execute(delete(Session).where(Session.token_hash == digest(authorization.removeprefix("Bearer "))))
    await db.commit()

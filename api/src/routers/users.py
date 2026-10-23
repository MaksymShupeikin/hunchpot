from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.auth import current_user_optional, get_current_user
from src.core.database import get_db
from src.models import Bet, BetStatus, School, Stake, User
from src.routers.bets import BetOut, bet_views
from src.services.records import record_query
from src.services.schools import is_open, member_count

router = APIRouter(tags=["users"])

# ── Schemas ───────────────────────────────────────────────────────────────────

class MeOut(BaseModel):
    handle: str
    name: str
    hue: int
    balance: int
    school: str
    calls: int  # settled bets staked on
    hits: int   # of those, called right
    live: int   # open bets staked on
    email: str
    school_open: bool  # false while the campus is on its waitlist
    members: int       # verified students on this campus
    unlock_at: int     # members needed to open a waitlisted campus


class RankOut(BaseModel):
    rank: int
    handle: str
    name: str
    hue: int
    calls: int
    hits: int
    is_me: bool

# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=MeOut)
async def me(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    school = await db.get(School, user.school_id)
    record = (await db.execute(record_query().where(Stake.user_id == user.id))).first()
    live = await db.scalar(
        select(func.count(distinct(Stake.bet_id)))
        .join(Bet, Bet.id == Stake.bet_id)
        .where(Stake.user_id == user.id, Bet.status.in_([BetStatus.open, BetStatus.locked]))
    )
    return MeOut(
        handle=user.handle, name=user.name, hue=user.hue, balance=user.balance, school=school.name,
        calls=record.calls if record else 0, hits=record.hits if record else 0, live=live or 0,
        email=user.email, school_open=await is_open(db, school), members=await member_count(db, school.id),
        unlock_at=school.unlock_at,
    )


@router.get("/me/bets", response_model=list[BetOut])
async def my_bets(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    staked = select(Stake.bet_id).where(Stake.user_id == user.id)
    bets = list((await db.scalars(
        select(Bet).where(Bet.id.in_(staked))
        .order_by((Bet.status == BetStatus.settled).asc(), Bet.closes_at.asc())
    )).unique())
    return await bet_views(db, bets, user)


@router.get("/leaderboard", response_model=list[RankOut])
async def leaderboard(db: AsyncSession = Depends(get_db), user: User | None = Depends(current_user_optional)):
    """Your campus when signed in; every campus for a guest."""
    record = record_query().subquery()
    q = (
        select(User, record.c.calls, record.c.hits)
        .join(record, record.c.user_id == User.id)
        .order_by(record.c.hits.desc(), record.c.calls.asc(), User.handle)
        .limit(50)
    )
    rows = (await db.execute(q.where(User.school_id == user.school_id) if user else q)).all()
    return [
        RankOut(rank=i + 1, handle=u.handle, name=u.name, hue=u.hue,
                calls=calls, hits=hits, is_me=user is not None and u.id == user.id)
        for i, (u, calls, hits) in enumerate(rows)
    ]

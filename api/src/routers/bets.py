from datetime import datetime, timedelta, timezone
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.auth import current_user_optional, get_current_user
from src.core.config import settings
from src.core.database import get_db
from src.models import Bet, BetStatus, Category, Outcome, School, SchoolStatus, Stake, User
from src.services.records import record_query
from src.services.schools import is_open

router = APIRouter(prefix="/bets", tags=["bets"])

# ── Schemas ───────────────────────────────────────────────────────────────────

class PersonOut(BaseModel):
    handle: str
    name: str
    hue: int


class OutcomeOut(BaseModel):
    id: int
    label: str
    pot: int
    share: float
    multiplier: float | None  # None until someone stakes on it


class MyStakeOut(BaseModel):
    outcome_id: int
    amount: int
    payout: int | None  # set once the bet is settled


class BetOut(BaseModel):
    id: int
    question: str
    category: Category
    status: BetStatus
    closes_at: datetime
    created_at: datetime
    creator: PersonOut
    pot: int
    players: int
    faces: list[PersonOut]
    outcomes: list[OutcomeOut]
    winning_outcome_id: int | None
    mine: MyStakeOut | None
    can_stake: bool  # the viewer is a verified student of this bet's campus


class ProfileOut(PersonOut):
    calls: int  # settled bets staked on
    hits: int   # of those, called right


class StakerOut(ProfileOut):
    outcome_id: int
    amount: int
    is_me: bool


class CrowdOut(BaseModel):
    host: ProfileOut
    stakers: list[StakerOut]  # one row per person and side, biggest stake first


class CreateBetRequest(BaseModel):
    question: str = Field(min_length=8, max_length=settings.question_max)
    category: Category
    outcomes: list[str] = Field(min_length=2, max_length=4)
    closes_at: datetime

    @field_validator("outcomes")
    @classmethod
    def outcomes_valid(cls, v: list[str]) -> list[str]:
        labels = [o.strip() for o in v]
        if any(not 1 <= len(o) <= 40 for o in labels):
            raise ValueError("Each outcome needs 1-40 characters")
        if len({o.lower() for o in labels}) != len(labels):
            raise ValueError("Outcomes must be different")
        return labels

    @field_validator("closes_at")
    @classmethod
    def closes_in_future(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            raise ValueError("closes_at needs a timezone")
        now = datetime.now(timezone.utc)
        if not now + timedelta(minutes=10) <= v <= now + timedelta(days=90):
            raise ValueError("Close time must be between 10 minutes and 90 days from now")
        return v


class StakeRequest(BaseModel):
    outcome_id: int
    amount: int

    @field_validator("amount")
    @classmethod
    def amount_valid(cls, v: int) -> int:
        if v < settings.min_stake:
            raise ValueError(f"Minimum stake is {settings.min_stake} cents")
        return v

# ── Helpers ───────────────────────────────────────────────────────────────────

def _person(u: User) -> PersonOut:
    return PersonOut(handle=u.handle, name=u.name, hue=u.hue)


async def bet_views(db: AsyncSession, bets: list[Bet], user: User | None) -> list[BetOut]:
    """Attach pool numbers to bets. Odds are parimutuel: pot / outcome pot."""
    if not bets:
        return []
    ids = [b.id for b in bets]

    outcome_pots = dict((await db.execute(
        select(Stake.outcome_id, func.sum(Stake.amount))
        .where(Stake.bet_id.in_(ids)).group_by(Stake.outcome_id)
    )).all())
    players = dict((await db.execute(
        select(Stake.bet_id, func.count(distinct(Stake.user_id)))
        .where(Stake.bet_id.in_(ids)).group_by(Stake.bet_id)
    )).all())
    mine = {bet_id: (outcome_id, amount) for bet_id, outcome_id, amount in (await db.execute(
        select(Stake.bet_id, Stake.outcome_id, func.sum(Stake.amount))
        .where(Stake.bet_id.in_(ids), Stake.user_id == user.id)
        .group_by(Stake.bet_id, Stake.outcome_id)
    )).all()} if user else {}

    # three most recent distinct stakers per bet
    last = (
        select(Stake.bet_id, Stake.user_id, func.max(Stake.created_at).label("at"))
        .where(Stake.bet_id.in_(ids)).group_by(Stake.bet_id, Stake.user_id).subquery()
    )
    ranked = (
        select(last.c.bet_id, User,
               func.row_number().over(partition_by=last.c.bet_id, order_by=last.c.at.desc()).label("rn"))
        .join(User, User.id == last.c.user_id).subquery()
    )
    faces: dict[int, list[PersonOut]] = {}
    for row in (await db.execute(select(ranked).where(ranked.c.rn <= 3).order_by(ranked.c.rn))).all():
        faces.setdefault(row.bet_id, []).append(PersonOut(handle=row.handle, name=row.name, hue=row.hue))

    out = []
    for b in bets:
        pot = sum(outcome_pots.get(o.id, 0) for o in b.outcomes)
        my = mine.get(b.id)
        payout = None
        if my and b.status == BetStatus.settled:
            win_pot = outcome_pots.get(b.winning_outcome_id, 0)
            payout = my[1] * pot // win_pot if my[0] == b.winning_outcome_id and win_pot else 0
        out.append(BetOut(
            id=b.id, question=b.question, category=b.category, status=b.status,
            closes_at=b.closes_at, created_at=b.created_at, creator=_person(b.creator),
            pot=pot, players=players.get(b.id, 0), faces=faces.get(b.id, []),
            # shortcut: no platform fee in the odds yet, add it here when the fee model is decided
            outcomes=[OutcomeOut(
                id=o.id, label=o.label, pot=(p := outcome_pots.get(o.id, 0)),
                share=round(p / pot, 4) if pot else 0,
                multiplier=round(pot / p, 2) if p else None,
            ) for o in b.outcomes],
            winning_outcome_id=b.winning_outcome_id,
            mine=MyStakeOut(outcome_id=my[0], amount=my[1], payout=payout) if my else None,
            can_stake=user is not None and user.school_id == b.school_id,
        ))
    return out

# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[BetOut])
async def list_bets(
    tab: Literal["hot", "new", "closing"] = "hot",
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(current_user_optional),
):
    """A student sees their campus; a guest browses every open campus until they sign in to bet."""
    pot = (
        select(Stake.bet_id, func.sum(Stake.amount).label("pot"))
        .group_by(Stake.bet_id).subquery()
    )
    q = (
        select(Bet).outerjoin(pot, pot.c.bet_id == Bet.id)
        .where(Bet.status == BetStatus.open, Bet.closes_at > func.now())
    )
    q = q.where(Bet.school_id == user.school_id) if user else q.join(School, School.id == Bet.school_id).where(
        School.status == SchoolStatus.live
    )
    order = {
        "hot": func.coalesce(pot.c.pot, 0).desc(),
        "new": Bet.created_at.desc(),
        "closing": Bet.closes_at.asc(),
    }[tab]
    bets = list((await db.scalars(q.order_by(order).limit(50))).unique())
    return await bet_views(db, bets, user)


# a shared link works for anyone, signed in or not; staking stays with the bet's campus
@router.get("/{bet_id}", response_model=BetOut)
async def get_bet(bet_id: int, db: AsyncSession = Depends(get_db), user: User | None = Depends(current_user_optional)):
    bet = await db.get(Bet, bet_id)
    if bet is None:
        raise HTTPException(status_code=404, detail="Bet not found")
    return (await bet_views(db, [bet], user))[0]


async def _require_campus(db: AsyncSession, user: User, school_id: int) -> None:
    """Only verified students of an open campus may create or stake there."""
    if user.school_id != school_id or user.verified_at is None:
        raise HTTPException(status_code=403, detail="Only students of this campus can do that")
    school = await db.get(School, school_id)
    if not await is_open(db, school):
        raise HTTPException(status_code=403, detail="Your campus is not open yet")


@router.get("/{bet_id}/crowd", response_model=CrowdOut)
async def get_crowd(bet_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    bet = await db.get(Bet, bet_id)
    if bet is None:
        raise HTTPException(status_code=404, detail="Bet not found")
    if bet.school_id != user.school_id:
        raise HTTPException(status_code=403, detail="Only students of this campus can see who is in")
    record = record_query().subquery()
    amount = func.sum(Stake.amount)
    rows = (await db.execute(
        select(User, Stake.outcome_id, amount, record.c.calls, record.c.hits)
        .join(Stake, Stake.user_id == User.id)
        .outerjoin(record, record.c.user_id == User.id)
        .where(Stake.bet_id == bet_id)
        .group_by(User.id, Stake.outcome_id, record.c.calls, record.c.hits)
        .order_by(amount.desc(), User.handle)
    )).all()
    host_record = (await db.execute(record_query().where(Stake.user_id == bet.creator_id))).first()
    return CrowdOut(
        host=ProfileOut(**_person(bet.creator).model_dump(),
                        calls=host_record.calls if host_record else 0, hits=host_record.hits if host_record else 0),
        stakers=[
            StakerOut(**_person(u).model_dump(), outcome_id=outcome_id, amount=total,
                      calls=calls or 0, hits=hits or 0, is_me=u.id == user.id)
            for u, outcome_id, total, calls, hits in rows
        ],
    )


@router.post("", response_model=BetOut, status_code=201)
async def create_bet(
    body: CreateBetRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await _require_campus(db, user, user.school_id)
    bet = Bet(
        school_id=user.school_id, creator_id=user.id, question=body.question.strip(),
        category=body.category, closes_at=body.closes_at,
    )
    bet.outcomes = [Outcome(label=label, position=i) for i, label in enumerate(body.outcomes)]
    db.add(bet)
    await db.commit()
    await db.refresh(bet)
    return (await bet_views(db, [bet], user))[0]


@router.post("/{bet_id}/stakes", response_model=BetOut, status_code=201)
async def place_stake(
    bet_id: int,
    body: StakeRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    bet = await db.get(Bet, bet_id)
    if bet is None:
        raise HTTPException(status_code=404, detail="Bet not found")
    if bet.status != BetStatus.open or bet.closes_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=409, detail="This bet is closed")
    if body.outcome_id not in {o.id for o in bet.outcomes}:
        raise HTTPException(status_code=422, detail="Outcome does not belong to this bet")
    await _require_campus(db, user, bet.school_id)

    # lock the user row first so two taps can't spend the same money or pick both sides
    payer = await db.scalar(
        select(User).where(User.id == user.id).with_for_update()
        .execution_options(populate_existing=True)
    )
    other_side = await db.scalar(
        select(Stake.id).where(Stake.bet_id == bet_id, Stake.user_id == user.id,
                               Stake.outcome_id != body.outcome_id).limit(1)
    )
    if other_side:
        raise HTTPException(status_code=409, detail="You already picked another side")
    if payer.balance < body.amount:
        raise HTTPException(status_code=402, detail="Not enough balance")
    payer.balance -= body.amount
    db.add(Stake(bet_id=bet_id, outcome_id=body.outcome_id, user_id=user.id, amount=body.amount))
    await db.commit()
    return (await bet_views(db, [bet], user))[0]

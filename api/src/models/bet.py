import enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from .user import User


class Category(str, enum.Enum):
    exams = "exams"
    sports = "sports"
    events = "events"
    campus = "campus"
    wild = "wild"


class BetStatus(str, enum.Enum):
    open = "open"
    locked = "locked"  # closed for stakes, waiting for the result
    settled = "settled"
    void = "void"


class Bet(Base):
    __tablename__ = "bets"

    # the id doubles as the public catalog number (#0427) and share link
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    school_id: Mapped[int] = mapped_column(ForeignKey("schools.id"), nullable=False)
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    question: Mapped[str] = mapped_column(String(140), nullable=False)
    category: Mapped[Category] = mapped_column(Enum(Category), nullable=False)
    status: Mapped[BetStatus] = mapped_column(Enum(BetStatus), nullable=False, default=BetStatus.open)
    closes_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    winning_outcome_id: Mapped[int | None] = mapped_column(ForeignKey("outcomes.id", use_alter=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    outcomes: Mapped[list["Outcome"]] = relationship(
        foreign_keys="Outcome.bet_id", order_by="Outcome.position", lazy="selectin"
    )
    creator: Mapped[User] = relationship(lazy="joined")


class Outcome(Base):
    __tablename__ = "outcomes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    bet_id: Mapped[int] = mapped_column(ForeignKey("bets.id"), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(40), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class Stake(Base):
    __tablename__ = "stakes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    bet_id: Mapped[int] = mapped_column(ForeignKey("bets.id"), nullable=False, index=True)
    outcome_id: Mapped[int] = mapped_column(ForeignKey("outcomes.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # cents
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

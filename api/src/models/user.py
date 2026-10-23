import enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base


class SchoolKind(str, enum.Enum):
    university = "university"
    school = "school"


class SchoolStatus(str, enum.Enum):
    live = "live"
    waitlist = "waitlist"  # opens by itself once unlock_at students have joined


class School(Base):
    __tablename__ = "schools"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    # email domains that prove membership; subdomains count too (student.northgate.edu)
    domains: Mapped[list[str]] = mapped_column(ARRAY(String(120)), nullable=False, default=list)
    kind: Mapped[SchoolKind] = mapped_column(Enum(SchoolKind), nullable=False, default=SchoolKind.university)
    status: Mapped[SchoolStatus] = mapped_column(Enum(SchoolStatus), nullable=False, default=SchoolStatus.waitlist)
    unlock_at: Mapped[int] = mapped_column(Integer, nullable=False, default=100)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    school_id: Mapped[int] = mapped_column(ForeignKey("schools.id"), nullable=False)
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    handle: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    hue: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # avatar color, 0-359
    balance: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # cents
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

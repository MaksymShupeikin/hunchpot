from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import School, SchoolStatus, User


def email_domain(email: str) -> str:
    return email.rsplit("@", 1)[1]


async def school_for_email(db: AsyncSession, email: str) -> School | None:
    """The school whose domain the email ends in: northgate.edu also covers student.northgate.edu."""
    labels = email_domain(email).split(".")
    candidates = [".".join(labels[i:]) for i in range(len(labels) - 1)]  # never match a bare TLD
    return await db.scalar(select(School).where(School.domains.overlap(candidates)).limit(1))


async def member_count(db: AsyncSession, school_id: int) -> int:
    return await db.scalar(
        select(func.count(User.id)).where(User.school_id == school_id, User.verified_at.is_not(None))
    ) or 0


async def is_open(db: AsyncSession, school: School) -> bool:
    return school.status == SchoolStatus.live or await member_count(db, school.id) >= school.unlock_at

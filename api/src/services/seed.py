"""Demo campus so the skeleton has something to show. All names are fictional."""
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import Bet, BetStatus, Category, Outcome, School, SchoolStatus, Stake, User

USERS = [  # first one is the demo "me"
    ("alex.r", "Alex Rivera"), ("mira.k", "Mira Kovacs"), ("jonah.b", "Jonah Brooks"),
    ("priya.s", "Priya Shah"), ("theo.w", "Theo Walsh"), ("sam.l", "Sam Lee"),
    ("nia.o", "Nia Okafor"), ("leo.v", "Leo Varga"), ("ivy.c", "Ivy Chen"),
    ("dev.p", "Dev Patel"), ("ana.g", "Ana García"), ("max.h", "Max Hale"),
]

# question, category, outcomes, closes in, yes-lean (share of stakers on outcome 0), my pick
BETS = [
    ("Will the 8am Stats midterm get moved?", Category.exams, ["Yes", "No"], timedelta(hours=2, minutes=14), 0.64, None),
    ("Northgate beats Ridgeview on Saturday?", Category.sports, ["Yes", "No"], timedelta(days=2), 0.52, 0),
    ("Spring formal sells out in 24h?", Category.events, ["Yes", "No"], timedelta(days=1), 0.3, None),
    ("Who takes the debate final?", Category.events, ["Lions", "Owls", "Foxes"], timedelta(days=3), 0.45, 1),
    ("Snow day before Dec 15?", Category.wild, ["Yes", "No"], timedelta(weeks=7), 0.18, None),
    ("Taco Tuesday comes back to the dining hall this month?", Category.campus, ["Yes", "No"], timedelta(days=9), 0.58, None),
    ("Over 300 people show up to the hackathon?", Category.events, ["Over", "Under"], timedelta(days=5), 0.7, None),
    ("Library goes 24/7 for finals week?", Category.campus, ["Yes", "No"], timedelta(weeks=3), 0.41, None),
]

# settled and locked bets give the pocket and the leaderboard some history
PAST = [
    ("Fire drill during Chem lab this week?", Category.campus, ["Yes", "No"], BetStatus.settled, 0, 0.55, 0),
    ("Homecoming game goes to overtime?", Category.sports, ["Yes", "No"], BetStatus.settled, 1, 0.48, 0),
    ("Orgo midterm curve above 10 points?", Category.exams, ["Yes", "No"], BetStatus.locked, None, 0.6, 1),
    ("Club fair runs out of free pizza by noon?", Category.campus, ["Yes", "No"], BetStatus.settled, 0, 0.72, None),
]


async def seed_demo(db: AsyncSession) -> None:
    if await db.scalar(select(School.id).limit(1)):
        return
    rng = random.Random(427)
    now = datetime.now(timezone.utc)

    school = School(name="Northgate U", slug="northgate", domains=["northgate.edu"], status=SchoolStatus.live)
    # a second campus still gathering students, to show the waitlist
    db.add_all([school, School(name="Ridgeview College", slug="ridgeview", domains=["ridgeview.edu"],
                               status=SchoolStatus.waitlist, unlock_at=100)])
    await db.flush()

    users = [User(school_id=school.id, email=f"{h}@northgate.edu", verified_at=now, handle=h, name=n,
                  hue=rng.randrange(360), balance=rng.randrange(1000, 20000))
             for h, n in USERS]
    users[0].balance = 4250
    db.add_all(users)
    await db.flush()
    me, others = users[0], users[1:]

    def add_bet(question, category, labels, status, closes_at, winner, lean, my_pick):
        bet = Bet(school_id=school.id, creator_id=rng.choice(others).id, question=question,
                  category=category, status=status, closes_at=closes_at,
                  created_at=min(closes_at, now) - timedelta(days=rng.randrange(2, 6)))
        bet.outcomes = [Outcome(label=label, position=i) for i, label in enumerate(labels)]
        return bet, winner, lean, my_pick

    planned = [add_bet(q, c, o, BetStatus.open, now + d, None, lean, mine) for q, c, o, d, lean, mine in BETS]
    planned += [add_bet(q, c, o, s, now - timedelta(days=rng.randrange(1, 10)), w, lean, mine)
                for q, c, o, s, w, lean, mine in PAST]
    db.add_all(b for b, *_ in planned)
    await db.flush()

    for bet, winner, lean, my_pick in planned:
        if winner is not None:
            bet.winning_outcome_id = bet.outcomes[winner].id
        for u in rng.sample(others, rng.randrange(5, len(others))):
            first = rng.random() < lean
            pick = 0 if first else rng.randrange(1, len(bet.outcomes))
            db.add(Stake(bet_id=bet.id, outcome_id=bet.outcomes[pick].id, user_id=u.id,
                         amount=rng.choice([100, 200, 500, 500, 1000, 2000, 5000]),
                         created_at=bet.created_at + timedelta(minutes=rng.randrange(10, 2000))))
        if my_pick is not None:
            db.add(Stake(bet_id=bet.id, outcome_id=bet.outcomes[my_pick].id, user_id=me.id, amount=500,
                         created_at=bet.created_at + timedelta(minutes=30)))
    await db.commit()

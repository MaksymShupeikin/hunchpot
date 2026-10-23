from sqlalchemy import select, func, case, distinct

from src.models import Bet, BetStatus, Stake


def record_query():
    """Per-user calls and hits over settled bets."""
    return (
        select(
            Stake.user_id,
            func.count(distinct(Stake.bet_id)).label("calls"),
            func.count(distinct(case((Stake.outcome_id == Bet.winning_outcome_id, Stake.bet_id)))).label("hits"),
        )
        .join(Bet, Bet.id == Stake.bet_id)
        .where(Bet.status == BetStatus.settled)
        .group_by(Stake.user_id)
    )

import type { CSSProperties } from "react";
import type { Bet } from "@/lib/api";
import { closingSoon, money, multiplier, potMoney, timeLeft } from "@/lib/format";
import { Crowd } from "./Crowd";
import { Icon } from "./Icon";
import { PotField } from "./PotField";
import { ShareButton } from "./RailButtons";
import { Outcomes } from "./Stake";
import s from "./bet.module.css";

/** Display question: the longest word (after the first) is set in outline. */
export function Headline({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  const pick = words.reduce((best, w, i) => (i > 0 && w.length > words[best].length ? i : best), words.length > 1 ? 1 : 0);
  const size = text.length < 32 ? s.qL : text.length < 52 ? s.qM : s.qS;
  // the longest word must fit on one line, so it caps the size
  const len = Math.max(...words.map((w) => w.length));
  return (
    <h2 className={`${s.q} ${size} ${className ?? ""}`} style={{ "--len": len } as CSSProperties}>
      {words.map((w, i) => (
        <span key={i} className={i === pick ? "outline" : undefined}>
          {w}{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h2>
  );
}

/** Replaces the outcome buttons once a bet is over. */
function Result({ bet }: { bet: Bet }) {
  const winner = bet.outcomes.findIndex((o) => o.id === bet.winning_outcome_id);
  const mine = bet.mine;
  if (bet.status === "settled" && winner >= 0) {
    const net = mine?.payout != null ? mine.payout - mine.amount : null;
    return (
      <div className={s.result} style={{ background: `var(--o${winner % 4}-br)` }}>
        <span className={s.resultLabel}><Icon name="check" size={22} />{bet.outcomes[winner].label} won</span>
        {net !== null ? (
          <span className={s.resultNet}><small>You</small>{net >= 0 ? `+${money(net)}` : `−${money(-net)}`}</span>
        ) : null}
      </div>
    );
  }
  return (
    <div className={`${s.result} ${s.resultWait}`}>
      <span className={s.resultLabel}><Icon name="clock" size={22} />{bet.status === "void" ? "Refunded" : "Waiting for result"}</span>
    </div>
  );
}

// inside a button, long amounts drop cents or go compact so they stay readable
const short = (cents: number) => (money(cents).length > 7 ? potMoney(cents) : money(cents));

export function BetScreen({ bet, balance, guest = false }: { bet: Bet; balance: number; guest?: boolean }) {
  const left = timeLeft(bet.closes_at);
  const open = bet.status === "open" && left !== "";
  const mineIdx = bet.mine ? bet.outcomes.findIndex((o) => o.id === bet.mine!.outcome_id) : -1;
  const mineOutcome = mineIdx >= 0 ? bet.outcomes[mineIdx] : null;
  const payout = bet.mine && mineOutcome ? Math.floor((bet.mine.amount * bet.pot) / Math.max(mineOutcome.pot, 1)) : 0;

  return (
    <section className={s.screen} aria-label={bet.question}>
      <PotField
        id={bet.id}
        outcomes={bet.outcomes}
        dimmed={bet.outcomes.map((o) => !open && (bet.status !== "settled" || o.id !== bet.winning_outcome_id))}
      />
      <div className={s.scrim} />

      <div className={s.body}>
        {/* the rail sits beside the question, so the rows below can use the full width */}
        <div className={s.head}>
          <div className={s.text}>
            <Headline text={bet.question} />
            <Crowd
              betId={bet.id}
              host={bet.creator}
              faces={bet.faces}
              players={bet.players}
              pot={bet.pot}
              sides={bet.outcomes.map((o) => ({ id: o.id, label: o.label, pot: o.pot }))}
            />
          </div>
          <aside className={s.rail}>
            <ShareButton path={`/b/${bet.id}`} title={`${bet.question} Call it on Hunchpot`} label="Share bet" />
          </aside>
        </div>

        {/* the two numbers that decide a bet: how much is in it and how long it stays open */}
        <div className={s.stats}>
          <p className={s.pot} style={{ "--chars": potMoney(bet.pot).length } as CSSProperties}>
            <b>{potMoney(bet.pot)}</b>
            <span>pot</span>
          </p>
          {open ? (
            <p className={s.left} data-soon={closingSoon(bet.closes_at) || undefined}>
              <Icon name="clock" size={18} />
              {left}
            </p>
          ) : (
            <p className={s.left} data-ended>
              <Icon name={bet.status === "settled" ? "check" : "clock"} size={18} />
              Ended
            </p>
          )}
        </div>

        {open ? (
          <Outcomes
            betId={bet.id}
            pot={bet.pot}
            balance={balance}
            access={bet.can_stake ? "member" : guest ? "guest" : "outsider"}
            mine={bet.mine ? { outcomeId: bet.mine.outcome_id, stake: short(bet.mine.amount), payout: short(payout) } : null}
            outcomes={bet.outcomes.map((o) => ({ id: o.id, label: o.label, pot: o.pot, odds: multiplier(o.multiplier) }))}
          />
        ) : (
          <Result bet={bet} />
        )}
      </div>
    </section>
  );
}

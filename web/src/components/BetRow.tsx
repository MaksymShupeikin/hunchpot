import Link from "next/link";
import type { CSSProperties } from "react";
import type { Bet } from "@/lib/api";
import { money, timeLeft } from "@/lib/format";
import { Icon } from "./Icon";
import s from "./row.module.css";

/** Hard-stop gradient of the pot split: the bet's field, flattened into a bar. */
function splitBar(bet: Bet) {
  const n = bet.outcomes.length;
  let at = 0;
  const stops = bet.outcomes.map((o, i) => {
    const from = at;
    at += (bet.pot ? o.share : 1 / n) * 100;
    return `var(--o${i % 4}) ${from}% ${i === n - 1 ? 100 : at}%`;
  });
  return `linear-gradient(180deg, #ffffff40, transparent 45%, #0000004d), linear-gradient(90deg, ${stops.join(", ")})`;
}

function Status({ bet }: { bet: Bet }) {
  const mine = bet.mine;
  if (bet.status === "settled" && mine) {
    const net = (mine.payout ?? 0) - mine.amount;
    return net >= 0
      ? <span className={s.won}>+{money(net)}</span>
      : <span className={s.lost}>−{money(-net)}</span>;
  }
  if (bet.status === "void") return <span className={s.wait}>Refunded</span>;
  const left = timeLeft(bet.closes_at);
  return <span className={s.wait}>{left || "Waiting"}</span>;
}

export function BetRow({ bet }: { bet: Bet }) {
  const idx = bet.mine ? bet.outcomes.findIndex((o) => o.id === bet.mine!.outcome_id) : -1;
  const side = idx >= 0 ? bet.outcomes[idx] : null;
  const potential = bet.mine && side ? Math.floor((bet.mine.amount * bet.pot) / Math.max(side.pot, 1)) : 0;

  return (
    <Link href={`/b/${bet.id}`} className={s.row}>
      <span className={s.bar} style={{ background: splitBar(bet) }} />
      <span className={s.q}>{bet.question}</span>
      <span className={s.foot}>
        {bet.mine && side ? (
          <span className={s.mine} style={{ "--c": `var(--o${idx % 4}-br)` } as CSSProperties}>
            <b>{side.label}</b>
            {money(bet.mine.amount)}
            {bet.status === "open" || bet.status === "locked" ? (
              <span className={s.to}><Icon name="slide" size={16} />{money(potential)}</span>
            ) : null}
          </span>
        ) : null}
        <Status bet={bet} />
      </span>
    </Link>
  );
}

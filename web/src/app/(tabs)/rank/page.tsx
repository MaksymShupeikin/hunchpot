import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Suspense } from "react";
import { Avatar } from "@/components/Avatar";
import { getLeaderboard } from "@/lib/api";
import t from "../tabs.module.css";
import s from "./rank.module.css";

export const metadata: Metadata = { title: "Rank" };

export default function Rank() {
  return (
    <Suspense fallback={<main className={t.page} aria-busy="true" />}>
      <RankBody />
    </Suspense>
  );
}

// podium order on screen: 2nd, 1st, 3rd
const PODIUM = [1, 0, 2];
const PODIUM_TINT = ["--o2", "--o0", "--o1"];

async function RankBody() {
  const rows = await getLeaderboard();
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <main className={t.page}>
      <h1 className="sr-only">Leaderboard</h1>

      {top.length === 3 ? (
        <ol className={s.podium} aria-label="Top callers">
          {PODIUM.map((i) => {
            const r = top[i];
            return (
              <li key={r.handle} className={s.step} data-place={i + 1} style={{ "--c": `var(${PODIUM_TINT[i]})`, "--hi": `var(${PODIUM_TINT[i]}-hi)`, "--lo": `var(${PODIUM_TINT[i]}-lo)` } as CSSProperties}>
                <Avatar person={r} size={i === 0 ? 72 : 56} />
                <span className={s.stepName}>{r.name.split(" ")[0]}</span>
                <span className={s.block}>
                  <span className={s.place}>{i + 1}</span>
                  <span className={s.hits}>{r.hits}/{r.calls}</span>
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}

      <ol className={s.list}>
        {(top.length === 3 ? rest : rows).map((r) => (
          <li key={r.handle} className={s.row} data-me={r.is_me || undefined}>
            <span className={s.n}>{r.rank}</span>
            <Avatar person={r} size={40} />
            <span className={s.who}>
              <b>{r.is_me ? "You" : r.name}</b>
              <span>@{r.handle}</span>
            </span>
            <span className={s.score} aria-label={`${r.hits} right of ${r.calls}`}>
              {r.hits}<small>/{r.calls}</small>
            </span>
          </li>
        ))}
      </ol>
    </main>
  );
}

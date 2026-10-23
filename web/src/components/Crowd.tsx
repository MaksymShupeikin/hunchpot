"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import type { Crowd as CrowdData, Person } from "@/lib/api";
import { money, potMoney } from "@/lib/format";
import { signInHref } from "@/lib/session";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import b from "./bet.module.css";
import c from "./crowd.module.css";
import st from "./stake.module.css";

type Side = { id: number; label: string; pot: number };

/** Host tag and crowd group from the byline; either opens the sheet of who is in and for how much. */
export function Crowd({ betId, host, faces, players, pot, sides }: {
  betId: number;
  host: Person;
  faces: Person[];
  players: number;
  pot: number;
  sides: Side[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<CrowdData | null>(null);
  const [failed, setFailed] = useState<null | "error" | "guest" | "outsider">(null);

  async function load() {
    setFailed(null);
    try {
      const res = await fetch(`/api/bets/${betId}/crowd`);
      if (res.status === 401) return setFailed("guest");
      if (res.status === 403) return setFailed("outsider");
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
    } catch {
      setFailed("error");
    }
  }

  function open() {
    dialog.current?.showModal();
    dialog.current?.focus();
    load(); // always fresh: people keep joining
  }

  return (
    <>
      {/* host on the left as a tag, the crowd on the right as an avatar group */}
      <div className={b.byline}>
        <button className={b.host} onClick={open} aria-label={`Host @${host.handle}, see who is in`}>
          <Avatar person={host} size={26} />
          <span className={b.handle}>@{host.handle}</span>
        </button>
        {players ? (
          <button className={b.crowd} onClick={open} aria-label={`${players} people in, see who`}>
            {faces.map((p) => <Avatar key={p.handle} person={p} size={26} />)}
            {players > faces.length ? <span className={b.more}>+{players - faces.length}</span> : null}
          </button>
        ) : null}
      </div>

      <dialog
        ref={dialog}
        tabIndex={-1}
        className={st.sheet}
        style={{ "--c": "var(--text)" } as CSSProperties} // white: everyone, not one side
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        aria-label="Who is in"
      >
        <div className={`${st.body} ${c.body}`}>
          <header className={st.head}>
            {/* same pattern as the stake sheet's pick and the side heads below: who first, then the money */}
            <span className={`${st.pick} ${c.pill}`} aria-label={`${players} people, ${potMoney(pot)} pot`}>
              <span className={c.heads}>
                <Icon name="crowd" size={18} />
                <span className={c.num}>{players}</span>
              </span>
              <b>{potMoney(pot)}</b>
            </span>
            <button className={st.close} onClick={() => dialog.current?.close()} aria-label="Close">
              <Icon name="close" size={22} />
            </button>
          </header>

          {data ? (
            <div className={c.list}>
              <div className={c.hostCard}>
                <span className={c.hostFace} title="Host">
                  <Avatar person={data.host} size={56} />
                  <span className={c.crown}><Icon name="crown" size={16} /></span>
                </span>
                <div className={c.hostText}>
                  <p className={c.hostName}>{data.host.name}</p>
                  <p className={c.meta}>@{data.host.handle}</p>
                </div>
              </div>

              {sides.map((side, i) => {
                const rows = data.stakers.filter((s) => s.outcome_id === side.id);
                return rows.length ? (
                  <section key={side.id} className={c.side} style={{ "--c": `var(--o${i % 4}-br)` } as CSSProperties}>
                    <h3 className={c.sideHead}>
                      <span className={c.sideTag}>{side.label}</span>
                      <b>{potMoney(side.pot)}</b>
                      <span className={c.count} aria-label={`${rows.length} people`}>
                        <Icon name="crowd" size={16} />
                        <span className={c.num}>{rows.length}</span>
                      </span>
                    </h3>
                    <ul className={c.rows}>
                      {rows.map((r) => (
                        <li key={r.handle} className={c.row} data-me={r.is_me || undefined}>
                          <Avatar person={r} size={38} />
                          <span className={c.who}>
                            <b>{r.is_me ? "You" : r.name}</b>
                            <span>@{r.handle}</span>
                          </span>
                          <b className={c.amount}>{money(r.amount)}</b>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null;
              })}

              {data.stakers.length ? null : <p className={c.empty}>No one is in yet. Be the first.</p>}
            </div>
          ) : failed === "guest" ? (
            <p className={c.empty}>
              <Link href={signInHref(`/b/${betId}`)} className={c.retry}>Sign in</Link> with your school email to see who is in.
            </p>
          ) : failed === "outsider" ? (
            <p className={c.empty}>Only students of this campus can see who is in.</p>
          ) : failed ? (
            <p className={st.error} role="alert">
              Could not load who is in. <button className={c.retry} onClick={load}>Try again</button>
            </p>
          ) : (
            <div className={c.list} aria-busy="true">
              <span className={c.ghost} />
              <span className={c.ghost} />
              <span className={c.ghost} />
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}

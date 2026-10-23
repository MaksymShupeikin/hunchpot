import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BetRow } from "@/components/BetRow";
import { Icon } from "@/components/Icon";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getMeOrNull, getMyBets } from "@/lib/api";
import { money } from "@/lib/format";
import t from "../tabs.module.css";
import s from "./pocket.module.css";

export const metadata: Metadata = { title: "Pocket" };

export default function Pocket() {
  return (
    <Suspense fallback={<main className={t.page} aria-busy="true" />}>
      <PocketBody />
    </Suspense>
  );
}

async function PocketBody() {
  const me = await getMeOrNull();
  if (!me) {
    return <SignInPrompt title={<>Your bets live <span className="outline">here</span></>} lead="Sign in with your school email to bet and keep score." next="/pocket" />;
  }
  const bets = await getMyBets();
  const live = bets.filter((b) => b.status === "open" || b.status === "locked");
  const done = bets.filter((b) => b.status === "settled" || b.status === "void");

  return (
    <main className={t.page}>
      <section className={s.wallet} aria-label="Wallet">
        <h1 className={s.balance}>{money(me.balance)}</h1>
        {/* shortcut: payments are not wired yet, these stay disabled until a provider is chosen */}
        <div className={s.actions}>
          <button className={s.action} disabled aria-label="Add money (coming soon)">
            <Icon name="arrowDown" size={22} />Add
          </button>
          <button className={s.action} disabled aria-label="Cash out (coming soon)">
            <Icon name="arrowUp" size={22} />Cash out
          </button>
        </div>
      </section>

      <section>
        <h2 className={t.sectionTitle}>Live · {live.length}</h2>
        {live.length ? (
          <div className={s.list}>{live.map((b) => <BetRow key={b.id} bet={b} />)}</div>
        ) : (
          <div className={t.empty}>
            <p>Nothing riding right now.</p>
            <Link href="/" className={t.cta}>Find a bet</Link>
          </div>
        )}
      </section>

      {done.length ? (
        <section>
          <h2 className={t.sectionTitle}>Settled</h2>
          <div className={s.list}>{done.map((b) => <BetRow key={b.id} bet={b} />)}</div>
        </section>
      ) : null}
    </main>
  );
}

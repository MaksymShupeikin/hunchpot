import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { ShareButton } from "@/components/RailButtons";
import { signOut } from "@/app/actions";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getMeOrNull } from "@/lib/api";
import { money } from "@/lib/format";
import t from "../tabs.module.css";
import s from "./me.module.css";

export const metadata: Metadata = { title: "Me" };

export default function MePage() {
  return (
    <Suspense fallback={<main className={t.page} aria-busy="true" />}>
      <MeBody />
    </Suspense>
  );
}

async function MeBody() {
  const me = await getMeOrNull();
  if (!me) {
    return <SignInPrompt title={<>Make your <span className="outline">calls</span> count</>} lead="Sign in with your school email to get a profile, a record and a spot on the leaderboard." next="/me" />;
  }
  const misses = me.calls - me.hits;

  return (
    <main className={t.page}>
      <header className={s.head}>
        <Avatar person={me} size={96} />
        <h1 className={s.name}>{me.name}</h1>
        <p className={s.handle}>@{me.handle} · {me.school}</p>
        <p className={s.email}>{me.email}</p>
      </header>

      {/* the record drawn like a bet: right calls vs wrong calls */}
      <section aria-label={`${me.hits} right, ${misses} wrong`}>
        <div className={s.record}>
          <span className={s.hit} style={{ flexGrow: Math.max(me.hits, 0.4) }}>
            <b>{me.hits}</b>right
          </span>
          <span className={s.miss} style={{ flexGrow: Math.max(misses, 0.4) }}>
            <b>{misses}</b>wrong
          </span>
        </div>
        <p className={s.live}>{me.live} live · {money(me.balance)} in pocket</p>
      </section>

      <div className={s.actions}>
        <ShareButton path="/join" title="Bet on campus with me on Hunchpot" label="Invite friends" className={s.invite}>
          Invite friends
        </ShareButton>
        <Link href="/pocket" className={s.link}>
          <Icon name="pocket" size={22} />Pocket
        </Link>
        <form action={signOut}>
          <button className={s.signOut}>Log out</button>
        </form>
      </div>
    </main>
  );
}

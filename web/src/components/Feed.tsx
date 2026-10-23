import Link from "next/link";
import type { Bet, Me, Tab } from "@/lib/api";
import { money } from "@/lib/format";
import { signInHref } from "@/lib/session";
import { BetScreen } from "./BetScreen";
import { Icon } from "./Icon";
import { StableFeed } from "./StableFeed";
import s from "./feed.module.css";

const TABS: { tab: Tab; label: string }[] = [
  { tab: "hot", label: "Hot" },
  { tab: "new", label: "New" },
  { tab: "closing", label: "Closing" },
];

/** `me` is null for a guest who opened a shared bet; `next` brings them back here after signing in. */
export function Feed({ bets, me, tab, next = "/" }: { bets: Bet[]; me: Me | null; tab: Tab | null; next?: string }) {
  return (
    <>
      <header className={s.top}>
        <nav className={s.tabs} aria-label="Sort">
          {TABS.map((t) => (
            <Link key={t.tab} href={`/?tab=${t.tab}`} aria-current={t.tab === tab ? "page" : undefined} scroll={false}>
              {t.label}
            </Link>
          ))}
        </nav>
        {me ? (
          <Link href="/pocket" className={s.balance} aria-label={`Balance ${money(me.balance)}`}>
            <Icon name="coin" size={18} />
            {money(me.balance)}
          </Link>
        ) : (
          <Link href={signInHref(next)} className={s.balance}>Sign in</Link>
        )}
      </header>
      {bets.length ? (
        // a new tab is a new list, so its order starts fresh
        <StableFeed key={tab ?? "bet"} className={s.feed}>
          {bets.map((b) => <BetScreen key={b.id} bet={b} balance={me?.balance ?? 0} guest={!me} />)}
        </StableFeed>
      ) : (
        <main className={s.feed}>
          <div className={s.empty}>
            <p className={s.emptyTitle}>Quiet on campus</p>
            <Link href="/new" className={s.emptyCta}><Icon name="plus" size={20} />Start a bet</Link>
          </div>
        </main>
      )}
    </>
  );
}

export function FeedSkeleton() {
  return (
    <main className={s.feed} aria-busy="true">
      <div className={s.skeleton}>
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}

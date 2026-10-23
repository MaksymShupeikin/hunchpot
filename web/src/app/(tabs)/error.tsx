"use client";

import s from "./tabs.module.css";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className={s.page}>
      <div className={s.empty}>
        <h1 className={s.title}>Campus is offline</h1>
        <p>We could not load bets. Check your connection and try again.</p>
        <button className={s.cta} onClick={reset}>Try again</button>
      </div>
    </main>
  );
}

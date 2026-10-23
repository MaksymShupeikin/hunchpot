import Link from "next/link";
import s from "../../tabs.module.css";

export default function BetNotFound() {
  return (
    <main className={s.page}>
      <div className={s.empty}>
        <h1 className={s.title}>No such bet</h1>
        <p>The link may be wrong, or the bet was removed.</p>
        <Link href="/" className={s.cta}>Back to the feed</Link>
      </div>
    </main>
  );
}

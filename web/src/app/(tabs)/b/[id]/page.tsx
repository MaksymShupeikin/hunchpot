import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Feed, FeedSkeleton } from "@/components/Feed";
import { ApiError, getBet, getBets, getMeOrNull } from "@/lib/api";
import { potMoney } from "@/lib/format";

async function findBet(id: string) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return getBet(n).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e)));
}

export async function generateMetadata({ params }: PageProps<"/b/[id]">): Promise<Metadata> {
  const bet = await findBet((await params).id);
  if (!bet) return {};
  const description = `${potMoney(bet.pot)} pot · ${bet.players} in. Call it on Hunchpot.`;
  return { title: bet.question, description, openGraph: { title: bet.question, description } };
}

export default function BetPage({ params }: PageProps<"/b/[id]">) {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <BetFeed params={params} />
    </Suspense>
  );
}

// a shared link opens on that bet, then keeps going through the campus feed
async function BetFeed({ params }: Pick<PageProps<"/b/[id]">, "params">) {
  const { id } = await params;
  // after the shared bet the feed keeps going: the student's campus, or every open campus for a guest
  const [bet, me, more] = await Promise.all([findBet(id), getMeOrNull(), getBets("hot")]);
  if (!bet) notFound();
  return <Feed bets={[bet, ...more.filter((b) => b.id !== bet.id)]} me={me} tab={null} next={`/b/${bet.id}`} />;
}

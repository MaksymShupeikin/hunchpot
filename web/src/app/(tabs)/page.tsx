import { Suspense } from "react";
import { Feed, FeedSkeleton } from "@/components/Feed";
import { Waitlist } from "@/components/Waitlist";
import { getBets, getMeOrNull, type Tab } from "@/lib/api";

const TABS: Tab[] = ["hot", "new", "closing"];

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <HomeFeed searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeFeed({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { tab } = await searchParams;
  const current = TABS.find((t) => t === tab) ?? "hot";
  const [bets, me] = await Promise.all([getBets(current), getMeOrNull()]);
  return me && !me.school_open ? <Waitlist me={me} /> : <Feed bets={bets} me={me} tab={current} />;
}

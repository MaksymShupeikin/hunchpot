import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getMeOrNull } from "@/lib/api";
import { JoinFlow } from "./JoinFlow";

// only same-site paths, never an absolute URL from the query string
const safe = (next: unknown) => (typeof next === "string" && /^\/(?![\/\\])/.test(next) ? next : "/");

export const metadata: Metadata = { title: "Sign in" };

export default function Join({ searchParams }: PageProps<"/join">) {
  return (
    <Suspense fallback={null}>
      <JoinWithNext searchParams={searchParams} />
    </Suspense>
  );
}

async function JoinWithNext({ searchParams }: Pick<PageProps<"/join">, "searchParams">) {
  const [{ next }, me] = await Promise.all([searchParams, getMeOrNull()]);
  // a working session skips the form; a stale one just gets replaced when the student signs in
  if (me) redirect(safe(next));
  return <JoinFlow next={safe(next)} />;
}

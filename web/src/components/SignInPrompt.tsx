import Link from "next/link";
import type { ReactNode } from "react";
import { signInHref } from "@/lib/session";
import s from "./prompt.module.css";

/** A personal tab seen by a guest: no redirect, just what is here and one way in. */
export function SignInPrompt({ title, lead, next }: { title: ReactNode; lead: string; next: string }) {
  return (
    <main className={s.screen}>
      <h1 className={s.title}>{title}</h1>
      <p className={s.lead}>{lead}</p>
      <Link href={signInHref(next)} className={s.cta}>Sign in</Link>
    </main>
  );
}

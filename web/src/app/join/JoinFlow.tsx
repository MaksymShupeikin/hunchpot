"use client";

import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { PotField } from "@/components/PotField";
import { SignInForm } from "@/components/SignInForm";
import s from "./join.module.css";

/** The full-screen sign-in, for direct visits and the pages that need an account. */
export function JoinFlow({ next }: { next: string }) {
  return (
    <main className={s.screen}>
      <PotField id={11} outcomes={[{ share: 0 }, { share: 0 }]} />
      <div className={s.scrim} />
      <header className={s.top}>
        <BrandMark />
        {/* signing in is never a wall: back to where they were, or the feed when that page needs an account */}
        <Link href={next.startsWith("/new") ? "/" : next} className={s.close} aria-label="Close, keep browsing">
          <Icon name="close" size={22} />
        </Link>
      </header>
      <div className={s.body}>
        <SignInForm next={next} />
      </div>
    </main>
  );
}

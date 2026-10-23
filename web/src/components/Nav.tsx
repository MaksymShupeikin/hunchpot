"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { Icon, type IconName } from "./Icon";
import s from "./nav.module.css";

const ITEMS: { href: string; icon: IconName; label: string; tint: string }[] = [
  { href: "/", icon: "feed", label: "Feed", tint: "var(--o0-br)" },
  { href: "/rank", icon: "rank", label: "Rank", tint: "var(--o2-br)" },
  { href: "/pocket", icon: "pocket", label: "Pocket", tint: "var(--o3-br)" },
  { href: "/me", icon: "me", label: "Me", tint: "var(--o1-br)" },
];

export function Nav() {
  return <NavBar path={usePathname()} />;
}

/** Without a path (prerendered shell) nothing is marked current. */
export function NavBar({ path }: { path: string | null }) {
  const isActive = (href: string) =>
    path !== null && (href === "/" ? path === "/" || path.startsWith("/b/") : path.startsWith(href));
  const link = ({ href, icon, label, tint }: (typeof ITEMS)[number]) => (
    <Link
      key={href}
      href={href}
      className={s.item}
      aria-label={label}
      aria-current={isActive(href) ? "page" : undefined}
      style={{ "--tint": tint } as CSSProperties}
    >
      <Icon name={icon} size={28} />
    </Link>
  );

  return (
    <nav className={s.nav} aria-label="Main">
      {ITEMS.slice(0, 2).map(link)}
      <Link href="/new" className={s.create} aria-label="New bet">
        <Icon name="create" size={26} />
      </Link>
      {ITEMS.slice(2).map(link)}
    </nav>
  );
}

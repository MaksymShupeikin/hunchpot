"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "./Icon";
import s from "./bet.module.css";

/** Native share sheet, or copy the link where there is none. */
export function ShareButton({ path, title, label, className = s.railBtn, children }: {
  path: string;
  title: string;
  label: string;
  className?: string;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${location.origin}${path}`;
    if (navigator.share) {
      // closing the share sheet rejects; nothing to do
      await navigator.share({ title, text: title, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      className={className}
      onClick={share}
      aria-label={label}
      data-on={copied || undefined}
      style={{ "--icon-tint": "var(--o0-br)" } as CSSProperties}
    >
      <Icon name={copied ? "check" : "share"} size={children ? 22 : 28} />
      {children}
    </button>
  );
}

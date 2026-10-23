"use client";

import { Children, useState, type ReactNode } from "react";
import s from "./feed.module.css";

const keyOf = (node: ReactNode) => (node as { key: string | null }).key;

/** Keeps bets in the order they first appeared, so the refresh after a stake never moves the bet you are looking at. */
export function StableFeed({ className, children }: { className: string; children: ReactNode }) {
  const items = Children.toArray(children);
  const [order] = useState(() => items.map(keyOf));
  const [index, setIndex] = useState(0);
  const rank = (node: ReactNode) => {
    const i = order.indexOf(keyOf(node));
    return i < 0 ? order.length : i; // bets that appear later go to the end
  };

  return (
    <>
      <main
        className={className}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight))}
      >
        {items.toSorted((a, b) => rank(a) - rank(b))}
      </main>
      <Dots index={index} total={items.length} />
    </>
  );
}

/** One fixed position cue for the whole feed: a window of up to 7 dots, the current bet stretched. */
function Dots({ index, total }: { index: number; total: number }) {
  if (total < 2) return null;
  const n = Math.min(total, 7);
  const start = Math.min(Math.max(index - 3, 0), total - n);
  return (
    <div className={s.dotsLayer} aria-hidden="true">
      <span className={s.dots}>
        {Array.from({ length: n }, (_, i) => <i key={i} data-on={start + i === index || undefined} />)}
      </span>
    </div>
  );
}

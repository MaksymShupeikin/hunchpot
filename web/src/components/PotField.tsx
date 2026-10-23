import type { CSSProperties } from "react";
import type { Outcome } from "@/lib/api";
import s from "./bet.module.css";

const MIN_SHARE = 0.08; // a side with no money still gets a visible sliver

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fieldShares(outcomes: Pick<Outcome, "share">[]) {
  const total = outcomes.reduce((a, o) => a + o.share, 0);
  const floored = outcomes.map((o) => Math.max(total ? o.share : 1 / outcomes.length, MIN_SHARE));
  const sum = floored.reduce((a, v) => a + v, 0);
  return floored.map((v) => v / sum);
}

// a seam drawn at x=0 and moved into place with a transform, so a new split animates everywhere (CSS `d` does not in Safari)
const curve = (lean: number) => `M${lean} 0C${lean} 38 ${-lean} 62 ${-lean} 100`;
const at = (x: number): CSSProperties => ({ transform: `translateX(${x}px)` });

/** The bet's full-bleed media: one lit field per outcome, each as wide as its share of the pot. */
export function PotField({ id, outcomes, dimmed = [] }: {
  id: number;
  outcomes: Pick<Outcome, "share">[];
  dimmed?: boolean[]; // sides shaded down once the bet is over: the losers, or every side while it waits for a result
}) {
  const rnd = seeded(id);
  const shares = fieldShares(outcomes);
  const xs = shares.reduce<number[]>((acc, v) => [...acc, acc[acc.length - 1] + v * 100], [0]);
  // seams lean left or right; capped so a seam never crosses its neighbour
  const lean = xs.map((_, i) =>
    i === 0 || i === xs.length - 1 ? 0 : (rnd() > 0.5 ? 1 : -1) * Math.min(4 + rnd() * 6, 45 * Math.min(shares[i - 1], shares[i])),
  );

  return (
    <div className={s.field} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          {outcomes.map((_, i) => (
            <radialGradient key={i} id={`pf${id}-${i}`} gradientUnits="userSpaceOnUse" cx="22" cy="22" r="95">
              <stop offset="0" style={{ stopColor: `var(--o${i % 4}-hi)` }} />
              <stop offset="0.45" style={{ stopColor: `var(--o${i % 4})` }} />
              <stop offset="1" style={{ stopColor: `var(--o${i % 4}-lo)` }} />
            </radialGradient>
          ))}
        </defs>
        {/* each field runs past the right edge and the next one paints over it, so seams never gap */}
        {outcomes.map((_, i) => (
          <g key={i} className={s.move} style={at(xs[i])}>
            <path d={`${curve(lean[i])}H200V0Z`} fill={`url(#pf${id}-${i})`} />
            {dimmed[i] ? <path d={`${curve(lean[i])}H200V0Z`} fill="#0e0e12" fillOpacity="0.62" /> : null}
          </g>
        ))}
        {xs.slice(1, -1).map((x, j) => (
          <g key={j} className={s.move} fill="none" style={at(x)}>
            <path d={curve(lean[j + 1])} stroke="#000" strokeOpacity="0.22" strokeWidth="22" vectorEffect="non-scaling-stroke" />
            <path d={curve(lean[j + 1])} stroke="#fff" strokeOpacity="0.45" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
    </div>
  );
}

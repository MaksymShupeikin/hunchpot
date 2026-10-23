"use client";

import { useEffect, useRef, useState, useTransition, type CSSProperties, type PointerEvent, type RefObject } from "react";
import { placeStake } from "@/app/actions";
import { cleanDollars, estPayout, money, toCents, toDollars } from "@/lib/format";
import { Icon } from "./Icon";
import { SignInForm } from "./SignInForm";
import s from "./stake.module.css";

type Side = { id: number; label: string; pot: number; odds: string };

const tint = (i: number) =>
  ({ "--c": `var(--o${i % 4}-br)`, "--d": `var(--o${i % 4})`, "--hi": `var(--o${i % 4}-hi)`, "--lo": `var(--o${i % 4}-lo)` }) as CSSProperties;

export function Outcomes({ betId, pot, balance, mine, outcomes, access }: {
  betId: number;
  pot: number;
  balance: number;
  // member: stake here; outsider: another campus, look only; guest: sign in first, right here
  access: "member" | "outsider" | "guest";
  mine: { outcomeId: number; stake: string; payout: string } | null; // you can add to your side, not switch
  outcomes: Side[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const signIn = useRef<HTMLDialogElement>(null);
  const [wanted, setWanted] = useState<number | null>(null); // the side a guest picked before signing in

  const amountInput = useRef<HTMLInputElement>(null);

  function open(i: number) {
    const sheet = dialog.current;
    if (!sheet) return;
    setActive(i);
    sheet.showModal();
    sheet.focus();
    // the sheet rises first; only then the amount takes focus, without scrolling the sheet to reach it
    sheet.addEventListener(
      "animationend",
      (e) => {
        if (e.target !== sheet || !sheet.open) return;
        amountInput.current?.focus({ preventScroll: true });
      },
      { once: true },
    );
  }

  /** A guest is asked to sign in only now, over the bet; afterwards their stake sheet opens on the same side. */
  function tap(i: number) {
    if (access !== "guest") return open(i);
    setWanted(i);
    signIn.current?.showModal();
    signIn.current?.focus();
  }

  function signedIn() {
    signIn.current?.close();
    if (wanted !== null) open(wanted);
  }

  return (
    <>
      <div className={s.sides} data-many={outcomes.length > 2 || undefined}>
        {outcomes.map((o, i) => (
          <button
            key={o.id}
            className={s.side}
            style={tint(i)}
            onClick={() => tap(i)}
            disabled={access === "outsider" || (mine !== null && mine.outcomeId !== o.id)}
            title={access === "outsider" ? "Only students of this campus can bet" : undefined}
            data-mine={mine?.outcomeId === o.id || undefined}
            aria-label={
              mine?.outcomeId === o.id
                ? `${o.label}, your ${mine.stake} pays ${mine.payout}, add more`
                : `${o.label}, pays ${o.odds}`
            }
          >
            <span className={s.sideLabel}>{o.label}</span>
            {/* your side shows your position instead of the odds */}
            {mine?.outcomeId === o.id ? (
              <span className={s.sidePos} style={{ "--chars": mine.stake.length + mine.payout.length + 2 } as CSSProperties}>
                {mine.stake}
                <Icon name="slide" size={14} />
                {mine.payout}
              </span>
            ) : (
              <span className={s.sideOdds}>{o.odds}</span>
            )}
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        tabIndex={-1}
        className={s.sheet}
        style={active === null ? undefined : tint(active)}
        onClose={() => setActive(null)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        aria-label="Stake"
      >
        {active === null ? null : (
          <SheetBody
            inputRef={amountInput}
            key={active}
            betId={betId}
            side={outcomes[active]}
            pot={pot}
            balance={balance}
            onDone={() => dialog.current?.close()}
          />
        )}
      </dialog>
      {access === "guest" ? (
        <dialog
          ref={signIn}
          tabIndex={-1}
          className={s.sheet}
          style={wanted === null ? undefined : tint(wanted)}
          onClose={() => setWanted(null)}
          onClick={(e) => e.target === e.currentTarget && signIn.current?.close()}
          aria-label="Sign in to bet"
        >
          {wanted === null ? null : (
            <div className={s.body}>
              <header className={s.head}>
                <span className={s.pick}>{outcomes[wanted].label}<b>{outcomes[wanted].odds}</b></span>
                <button className={s.close} onClick={() => signIn.current?.close()} aria-label="Close">
                  <Icon name="close" size={22} />
                </button>
              </header>
              <SignInForm compact title={<>Sign in to <span className="outline">bet</span></>} onDone={signedIn} />
            </div>
          )}
        </dialog>
      ) : null}
    </>
  );
}

const CHIPS = [100, 500, 1000, 2000];

function SheetBody({ betId, side, pot, balance, onDone, inputRef }: {
  betId: number;
  side: Side;
  pot: number;
  balance: number;
  onDone: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const [typed, setTyped] = useState(""); // starts empty: the caret and a grey 0 invite you to type
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0); // remounts the slider after a failed stake
  const [progress, setProgress] = useState<number | null>(null); // slide position while dragging
  const [pending, startTransition] = useTransition();
  const amount = toCents(typed);
  const over = amount > balance;
  const payout = estPayout(amount, pot, side.pot);
  // while sliding, your stake visibly grows into the payout
  const win = money(progress === null ? payout : Math.round(amount + (payout - amount) * progress));
  // stake and win share one size, set by the longer of the two so neither overflows
  const chars = Math.max(typed.length + 1, win.length, 3);

  function commit() {
    setError(null);
    startTransition(async () => {
      const res = await placeStake(betId, side.id, amount);
      if (!res.error) return onDone();
      setError(res.error);
      setProgress(null);
      setAttempt((a) => a + 1);
    });
  }

  return (
    <div
      className={s.body}
      style={{ "--chars": chars } as CSSProperties}
      // a tap anywhere but the amount puts the keyboard away. On click, not pointerdown: hiding the keyboard
      // drops the sheet, and a pointerdown blur would let the finishing tap land on the amount and reopen it
      onClick={(e) => {
        if (!(e.target as Element).closest("label")) inputRef.current?.blur();
      }}
    >
      <header className={s.head}>
        <span className={s.pick}>{side.label}<b>{side.odds}</b></span>
        <button className={s.close} onClick={onDone} aria-label="Close">
          <Icon name="close" size={22} />
        </button>
      </header>

      {/* the stake is the field: tap the number and type your own */}
      <label className={s.amount} data-over={over || undefined}>
        $
        <span className={s.grow} data-value={typed || "0"}>
          <input
            ref={inputRef}
            inputMode="decimal"
            size={1} // width comes from the mirror text, not the input's default 20 characters
            value={typed}
            placeholder="0"
            onChange={(e) => setTyped(cleanDollars(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            aria-label="Stake in dollars"
          />
        </span>
      </label>
      <p className={s.winLabel}>to win</p>
      <p className={s.win} data-empty={amount === 0 || undefined} aria-live="polite">{win}</p>

      <div className={s.chips} role="group" aria-label="Amount">
        {CHIPS.map((c) => (
          <button key={c} className={s.chip} aria-pressed={amount === c} disabled={c > balance} onClick={() => setTyped(toDollars(c))}>
            {money(c)}
          </button>
        ))}
        <button className={s.chip} aria-pressed={balance >= 100 && amount === balance} disabled={balance < 100} onClick={() => setTyped(toDollars(balance))}>
          Max
        </button>
      </div>

      <SlideToStake
        onCommit={commit}
        onProgress={setProgress}
        pending={pending}
        disabled={amount < 100 || over}
        key={attempt}
      />
      {error ? <p className={s.error} role="alert">{error}</p> : null}
    </div>
  );
}

/** Signature move: drag the puck to the end to stake. A tap never stakes; keyboard confirms with Enter. */
function SlideToStake({ onCommit, onProgress, pending, disabled }: {
  onCommit: () => void;
  onProgress: (p: number | null) => void;
  pending: boolean;
  disabled: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x0: number; max: number; p: number } | null>(null);

  // the sheet flood follows the puck; position lives in CSS vars, not React state
  const setP = (p: number) => {
    track.current?.style.setProperty("--p", String(p));
    track.current?.closest("dialog")?.style.setProperty("--p", String(p));
  };

  useEffect(() => {
    track.current?.closest("dialog")?.style.setProperty("--p", "0");
  }, []);

  function down(e: PointerEvent<HTMLButtonElement>) {
    if (disabled || pending || !track.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const puck = e.currentTarget.getBoundingClientRect().width;
    drag.current = { x0: e.clientX, max: track.current.clientWidth - puck - 8, p: 0 };
    track.current.style.setProperty("--max", `${drag.current.max}px`);
    track.current.dataset.dragging = "";
    onProgress(0);
  }

  function move(e: PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d) return;
    d.p = Math.min(1, Math.max(0, (e.clientX - d.x0) / d.max));
    setP(d.p);
    onProgress(d.p);
  }

  function up() {
    const d = drag.current;
    drag.current = null;
    if (track.current) delete track.current.dataset.dragging;
    if (!d) return;
    if (d.p > 0.9) {
      setP(1);
      onProgress(1);
      onCommit();
    } else {
      setP(0);
      onProgress(null);
    }
  }

  return (
    <div ref={track} className={s.track} data-pending={pending || undefined} data-disabled={disabled || undefined}>
      <span className={s.flood} />
      <span className={s.trackLabel}>{pending ? "Staking…" : "Slide to stake"}</span>
      <button
        className={s.puck}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !pending) {
            e.preventDefault();
            track.current?.style.setProperty("--max", `${track.current.clientWidth - 64}px`);
            setP(1);
            onProgress(1);
            onCommit();
          }
        }}
        disabled={disabled}
        aria-label="Slide to stake, or press Enter"
      >
        <Icon name="slide" size={26} />
      </button>
    </div>
  );
}

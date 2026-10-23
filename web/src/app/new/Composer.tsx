"use client";

import Link from "next/link";
import { useActionState, useState, type CSSProperties } from "react";
import { createBet, type ActionResult } from "@/app/actions";
import { Icon, type IconName } from "@/components/Icon";
import { PotField } from "@/components/PotField";
import type { Category } from "@/lib/api";
import s from "./composer.module.css";

const CATEGORIES: { id: Category; label: string; tint: string }[] = [
  { id: "campus", label: "Campus", tint: "var(--o3-br)" },
  { id: "exams", label: "Exams", tint: "var(--o2-br)" },
  { id: "sports", label: "Sports", tint: "var(--o0-br)" },
  { id: "events", label: "Events", tint: "var(--o1-br)" },
  { id: "wild", label: "Wild card", tint: "var(--o2-hi)" },
];

const QUESTION_MAX = 70; // keep in sync with the API's question_max

const CLOSES = [
  { id: "hour", label: "1h" },
  { id: "tonight", label: "Tonight" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "Week" },
] as const;
type Close = (typeof CLOSES)[number]["id"];

/** Resolved at submit, in the student's own timezone. */
function closesAt(choice: Close, now = new Date()) {
  const d = new Date(now);
  if (choice === "hour") d.setHours(d.getHours() + 1);
  else if (choice === "week") d.setDate(d.getDate() + 7);
  else {
    if (choice === "tomorrow" || d.getHours() >= 23) d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
  }
  return d.toISOString();
}

export function Composer() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createBet, { error: null });
  // controlled, so a rejected post keeps what was typed (React resets uncontrolled fields after an action)
  const [question, setQuestion] = useState("");
  const charsLeft = QUESTION_MAX - question.length;
  // type steps down as the question grows, the same tiers the feed uses, so it always shows whole
  const qSize = question.length < 32 ? "l" : question.length < 52 ? "m" : "s";
  const [outcomes, setOutcomes] = useState(["Yes", "No"]);
  const [close, setClose] = useState<Close>("tomorrow");
  const [category, setCategory] = useState<Category>("campus");

  const setOutcome = (i: number, v: string) => setOutcomes((os) => os.map((o, j) => (j === i ? v : o)));

  return (
    <form
      className={s.screen}
      action={(fd) => {
        fd.set("closes_at", closesAt(close));
        formAction(fd);
      }}
    >
      <PotField id={7} outcomes={outcomes.map(() => ({ share: 0 }))} />
      <div className={s.scrim} />

      <header className={s.top}>
        <Link href="/" className={s.round} aria-label="Cancel">
          <Icon name="close" size={22} />
        </Link>
        <button className={s.post} disabled={pending}>
          {pending ? "Posting…" : "Post"}
        </button>
      </header>

      <div className={s.body}>
        <fieldset className={s.cats}>
          <legend className="sr-only">Category</legend>
          {CATEGORIES.map((c) => (
            <label key={c.id} className={s.cat} title={c.label} style={{ "--icon-tint": c.tint } as CSSProperties}>
              <input type="radio" name="category" value={c.id} checked={category === c.id} onChange={() => setCategory(c.id)} />
              <Icon name={c.id as IconName} size={24} />
              <span className="sr-only">{c.label}</span>
            </label>
          ))}
        </fieldset>

        <label className="sr-only" htmlFor="question">Question</label>
        <textarea
          id="question"
          name="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={s.question}
          data-size={qSize}
          placeholder="Will…?"
          maxLength={QUESTION_MAX}
          required
          minLength={8}
          rows={2}
          autoFocus
        />
        {charsLeft <= 20 ? (
          <span className={s.count} data-low={charsLeft <= 5 || undefined} aria-live="polite">
            {charsLeft}
          </span>
        ) : null}

        <div className={s.outcomes}>
          {outcomes.map((o, i) => (
            <span key={i} className={s.outcome} style={{ "--c": `var(--o${i % 4}-br)` } as CSSProperties}>
              <input
                name="outcome"
                value={o}
                onChange={(e) => setOutcome(i, e.target.value)}
                maxLength={40}
                required
                aria-label={`Outcome ${i + 1}`}
              />
              {i > 1 ? (
                <button type="button" className={s.drop} onClick={() => setOutcomes((os) => os.filter((_, j) => j !== i))} aria-label={`Remove ${o || "outcome"}`}>
                  <Icon name="close" size={16} />
                </button>
              ) : null}
            </span>
          ))}
          {outcomes.length < 4 ? (
            <button type="button" className={s.add} onClick={() => setOutcomes((os) => [...os, ""])} aria-label="Add outcome">
              <Icon name="plus" size={22} />
            </button>
          ) : null}
        </div>

        <fieldset className={s.closes}>
          <legend className="sr-only">Closes</legend>
          <Icon name="clock" size={22} />
          {CLOSES.map((c) => (
            <label key={c.id} className={s.close}>
              <input type="radio" name="close" checked={close === c.id} onChange={() => setClose(c.id)} />
              {c.label}
            </label>
          ))}
        </fieldset>

        {state.error ? <p className={s.error} role="alert">{state.error}</p> : null}
      </div>
    </form>
  );
}

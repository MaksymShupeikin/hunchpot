"use client";

import { useState, useTransition, type ReactNode } from "react";
import { startSignIn, verifyCode } from "@/app/actions";
import s from "./signin.module.css";

type Step = { kind: "email" } | { kind: "code"; school: string } | { kind: "unknown"; domain: string };

const CODE_LENGTH = 6;

/**
 * School email → one-time code → in. An unknown school lands on the demand list instead.
 * With `next` the student is sent there; with `onDone` they stay put (the sheet over a bet).
 */
export function SignInForm({ next, onDone, compact = false, title }: {
  next?: string;
  onDone?: () => void;
  compact?: boolean;
  title?: ReactNode;
}) {
  const [step, setStep] = useState<Step>({ kind: "email" });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send() {
    setError(null);
    startTransition(async () => {
      const res = await startSignIn(email);
      if (res.status === "error") setError(res.error);
      else if (res.status === "code_sent") {
        setCode("");
        setStep({ kind: "code", school: res.school });
      } else setStep({ kind: "unknown", domain: res.domain });
    });
  }

  function typeCode(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length < CODE_LENGTH) return;
    setError(null);
    startTransition(async () => {
      const res = await verifyCode(email, digits, next ?? null); // with next it redirects on success
      if (res?.error) {
        setError(res.error);
        setCode("");
      } else onDone?.();
    });
  }

  const back = () => {
    setError(null);
    setStep({ kind: "email" });
  };

  return (
    <div className={compact ? s.compact : undefined}>
      {step.kind === "email" ? (
        <form
          className={s.form}
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <h1 className={s.title}>{title ?? <>Call it on your <span className="outline">campus</span></>}</h1>
          <p className={s.lead}>Sign in with your school email.</p>
          <input
            className={s.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="School email"
            required
            autoFocus
          />
          <button className={s.cta} disabled={pending || !email.includes("@")}>
            {pending ? "Sending…" : "Get code"}
          </button>
        </form>
      ) : step.kind === "code" ? (
        <div className={s.form}>
          <h1 className={s.title}>Check your <span className="outline">inbox</span></h1>
          <p className={s.lead}>
            Code sent to <b>{email}</b>. It gets you into {step.school}.
          </p>
          <input
            className={s.code}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(e) => typeCode(e.target.value)}
            aria-label="6-digit code"
            disabled={pending}
            autoFocus
          />
          <p className={s.links}>
            <button type="button" onClick={send} disabled={pending}>Send again</button>
            <button type="button" onClick={back}>Use another email</button>
          </p>
        </div>
      ) : (
        <div className={s.form}>
          <h1 className={s.title}>Not on the <span className="outline">map</span> yet</h1>
          <p className={s.lead}>
            We do not know <b>{step.domain}</b> yet. Your spot is saved, and we will email you when it opens.
          </p>
          <button className={s.cta} onClick={back}>Try another email</button>
        </div>
      )}
      {error ? <p className={s.error} role="alert">{error}</p> : null}
    </div>
  );
}

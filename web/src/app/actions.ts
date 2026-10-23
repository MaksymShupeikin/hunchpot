"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError, type Bet } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

// every call carries the session cookie; the API decides who may do what
export type ActionResult = { error: string | null };

const message = (e: unknown) => (e instanceof ApiError ? e.message : "Could not reach Hunchpot");

export type StartResult =
  | { status: "code_sent"; school: string }
  | { status: "unknown_school"; domain: string }
  | { status: "error"; error: string };

export async function startSignIn(email: string): Promise<StartResult> {
  try {
    const res = await api<{ status: "code_sent" | "unknown_school"; school: string | null; domain: string }>(
      "/auth/start", { method: "POST", body: JSON.stringify({ email }) }, { guest: true },
    );
    return res.status === "code_sent"
      ? { status: "code_sent", school: res.school ?? "" }
      : { status: "unknown_school", domain: res.domain };
  } catch (e) {
    return { status: "error", error: message(e) };
  }
}

/** On success: with `next` the student is redirected; without it the page refreshes in place, signed in. */
export async function verifyCode(email: string, code: string, next: string | null): Promise<ActionResult> {
  let session: { token: string; expires_at: string };
  try {
    session = await api("/auth/verify", { method: "POST", body: JSON.stringify({ email, code }) }, { guest: true });
  } catch (e) {
    return { error: message(e) };
  }
  (await cookies()).set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    // shortcut: set COOKIE_SECURE=true behind HTTPS in production; local Docker serves plain http
    secure: process.env.COOKIE_SECURE === "true",
    expires: new Date(session.expires_at),
    path: "/",
  });
  if (next === null) {
    refresh();
    return { error: null };
  }
  // only same-site paths, never an absolute URL from the query string
  redirect(/^\/(?![\/\\])/.test(next) ? next : "/");
}

export async function signOut() {
  await api("/auth/logout", { method: "POST" }, { guest: true }).catch(() => {});
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/join");
}

export async function placeStake(betId: number, outcomeId: number, amount: number): Promise<ActionResult> {
  if (!Number.isInteger(betId) || !Number.isInteger(outcomeId) || !Number.isInteger(amount) || amount <= 0) {
    return { error: "Invalid stake" };
  }
  try {
    await api<Bet>(`/bets/${betId}/stakes`, {
      method: "POST",
      body: JSON.stringify({ outcome_id: outcomeId, amount }),
    });
  } catch (e) {
    return { error: message(e) };
  }
  refresh();
  return { error: null };
}

export async function createBet(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const outcomes = form.getAll("outcome").map(String).filter((o) => o.trim());
  let bet: Bet;
  try {
    bet = await api<Bet>("/bets", {
      method: "POST",
      body: JSON.stringify({
        question: String(form.get("question") ?? ""),
        category: String(form.get("category") ?? ""),
        closes_at: String(form.get("closes_at") ?? ""),
        outcomes,
      }),
    });
  } catch (e) {
    return { error: message(e) };
  }
  redirect(`/b/${bet.id}`);
}

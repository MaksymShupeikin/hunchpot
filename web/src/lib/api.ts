// Server-side client for the FastAPI backend. Money is always in cents.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, signInHref } from "./session";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export type Category = "exams" | "sports" | "events" | "campus" | "wild";
export type BetStatus = "open" | "locked" | "settled" | "void";

export type Person = { handle: string; name: string; hue: number };

export type Outcome = {
  id: number;
  label: string;
  pot: number;
  share: number;
  multiplier: number | null;
};

export type Bet = {
  id: number;
  question: string;
  category: Category;
  status: BetStatus;
  closes_at: string;
  created_at: string;
  creator: Person;
  pot: number;
  players: number;
  faces: Person[];
  outcomes: Outcome[];
  winning_outcome_id: number | null;
  mine: { outcome_id: number; amount: number; payout: number | null } | null;
  can_stake: boolean; // the viewer is a verified student of this bet's campus
};

export type Me = Person & {
  balance: number;
  school: string;
  calls: number;
  hits: number;
  live: number;
  email: string;
  school_open: boolean; // false while the campus waits for enough students
  members: number;
  unlock_at: number;
};

export type Rank = Person & { rank: number; calls: number; hits: number; is_me: boolean };

export type Profile = Person & { calls: number; hits: number };
export type Staker = Profile & { outcome_id: number; amount: number; is_me: boolean };
export type Crowd = { host: Profile; stakers: Staker[] };

export type Tab = "hot" | "new" | "closing";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Calls the API as the signed-in student. A rejected session sends them to sign in again,
 * unless `guest` is set: then the 401 comes back as an ApiError for pages that work signed out.
 */
export async function api<T>(path: string, init?: RequestInit, { guest = false } = {}): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (res.status === 401 && !guest) redirect(signInHref()); // the proxy clears the dead cookie there
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // FastAPI sends a string for HTTPException and a list for validation errors
    const detail = body?.detail;
    const message = typeof detail === "string" ? detail : detail?.[0]?.msg?.replace(/^Value error, /, "");
    throw new ApiError(res.status, message ?? "Something went wrong");
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// the feed and the leaderboard work for guests too: sign-in is asked for only when they bet
export const getBets = (tab: Tab) => api<Bet[]>(`/bets?tab=${tab}`, undefined, { guest: true });
export const getBet = (id: number) => api<Bet>(`/bets/${id}`, undefined, { guest: true });
export const getMe = () => api<Me>("/me");
/** The signed-in student, or null for a guest (shared bet links work signed out). */
export const getMeOrNull = () =>
  api<Me>("/me", undefined, { guest: true }).catch((e) => (e instanceof ApiError && e.status === 401 ? null : Promise.reject(e)));
export const getMyBets = () => api<Bet[]>("/me/bets");
export const getLeaderboard = () => api<Rank[]>("/leaderboard", undefined, { guest: true });

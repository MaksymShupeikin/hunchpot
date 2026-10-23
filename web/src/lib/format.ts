// shortcut: one display currency, move to the user's region once payments are wired
const CURRENCY = "USD";

const exact = new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY });
const whole = new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", {
  style: "currency", currency: CURRENCY, notation: "compact", maximumFractionDigits: 1,
});

/** Cents to "$42.50"; whole dollars drop the ".00"; pots from $10k go compact. */
export function money(cents: number) {
  if (cents >= 1_000_000) return compact.format(cents / 100);
  return cents % 100 === 0 ? whole.format(cents / 100) : exact.format(cents / 100);
}

/** Pots read as whole dollars, compact from $10k ("$12.4K"), so the number never runs past 7 characters. */
export const potMoney = (cents: number) =>
  cents >= 1_000_000 ? compact.format(cents / 100) : whole.format(Math.floor(cents / 100));

export const multiplier = (m: number | null) => (m === null ? "—" : `${m < 10 ? m.toFixed(1) : Math.round(m)}×`);

/** "45m", "2h 14m", "3d 5h", "7w"; empty string once closed. Server-rendered per request. */
export function timeLeft(iso: string, now = Date.now()) {
  const min = Math.floor((new Date(iso).getTime() - now) / 60_000);
  if (min <= 0) return "";
  if (min < 60) return `${min}m`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}h ${min % 60}m`;
  if (min < 60 * 24 * 14) {
    const h = Math.floor((min % 1440) / 60);
    return `${Math.floor(min / 1440)}d${h ? ` ${h}h` : ""}`;
  }
  return `${Math.floor(min / 10080)}w`;
}

/** Under an hour left: the time chip turns urgent. */
export const closingSoon = (iso: string, now = Date.now()) => new Date(iso).getTime() - now < 3_600_000;

/** Keeps what a student types to a dollar amount: digits, one dot, two decimals, six whole digits. */
export function cleanDollars(typed: string) {
  const [whole = "", ...rest] = typed.replace(/[^\d.]/g, "").split(".");
  return whole.slice(0, 6) + (rest.length ? `.${rest.join("").slice(0, 2)}` : "");
}

export const toCents = (dollars: string) => Math.round((parseFloat(dollars) || 0) * 100);
export const toDollars = (cents: number) => (cents % 100 ? (cents / 100).toFixed(2) : String(cents / 100));

/** Parimutuel payout if `amount` joins `side`: the stake itself moves the odds. */
export const estPayout = (amount: number, pot: number, sidePot: number) =>
  sidePot + amount > 0 ? Math.floor((amount * (pot + amount)) / (sidePot + amount)) : 0; // nothing staked yet pays nothing, not 0/0

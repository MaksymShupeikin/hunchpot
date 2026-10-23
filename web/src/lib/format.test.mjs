// node --test src/lib
import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanDollars, estPayout, money, multiplier, potMoney, timeLeft, toCents, toDollars } from "./format.ts";

test("payout counts your own stake in the pool", () => {
  // $100 pot, $20 on your side; your $5 makes it $105 / $25
  assert.equal(estPayout(500, 10000, 2000), 2100);
  // first money on an empty side takes the whole pot back
  assert.equal(estPayout(500, 0, 0), 500);
  // a $0 stake on an empty bet is 0, never NaN
  assert.equal(estPayout(0, 0, 0), 0);
  assert.equal(estPayout(0, 10000, 2000), 0);
});

test("money formatting", () => {
  assert.equal(money(4250), "$42.50");
  assert.equal(money(500), "$5");
  assert.equal(money(1_240_000), "$12.4K");
});

test("pot formatting stays short", () => {
  assert.equal(potMoney(24350), "$243");
  assert.equal(potMoney(999_950), "$9,999");
  assert.equal(potMoney(1_240_000), "$12.4K");
  assert.equal(potMoney(123_456_789), "$1.2M");
});

test("typed stake amounts", () => {
  assert.equal(cleanDollars("$12.345"), "12.34");
  assert.equal(cleanDollars("1.2.3"), "1.23");
  assert.equal(cleanDollars("abc"), "");
  assert.equal(cleanDollars("12345678"), "123456");
  assert.equal(cleanDollars("7."), "7.");
  assert.equal(toCents("12.34"), 1234);
  assert.equal(toCents("0.1"), 10);
  assert.equal(toCents(""), 0);
  assert.equal(toDollars(500), "5");
  assert.equal(toDollars(4250), "42.50");
});

test("multiplier", () => {
  assert.equal(multiplier(null), "—");
  assert.equal(multiplier(1.374), "1.4×");
  assert.equal(multiplier(22.8), "23×");
});

test("time left", () => {
  const now = Date.UTC(2026, 0, 1);
  const at = (min) => new Date(now + min * 60_000).toISOString();
  assert.equal(timeLeft(at(-1), now), "");
  assert.equal(timeLeft(at(45), now), "45m");
  assert.equal(timeLeft(at(134), now), "2h 14m");
  assert.equal(timeLeft(at(3 * 1440), now), "3d");
  assert.equal(timeLeft(at(3 * 1440 + 5 * 60 + 9), now), "3d 5h");
  assert.equal(timeLeft(at(49 * 1440), now), "7w");
});

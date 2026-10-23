# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (frontend) + FastAPI (backend) + PostgreSQL, all run through Docker Compose. Chosen by the user.

## Users

Students at universities and schools. They use it on their phone, on the go: between classes, in the hallway, in group chats. Their job: turn the "I bet you that…" moments of campus life into a real bet, put money on a call, and watch it play out with friends.

## Product Purpose

Hunchpot is a peer-to-peer pool betting (parimutuel) platform for events inside a school or university. Students create a bet ("a hunch"), others stake on an outcome, and the pot splits among the winners. The platform puts no house money in. Success means people create and share bets on their own, without being prompted, and come back every day to check how their calls are doing.

## Positioning

The only betting surface scoped to *your* campus: the events, people and rituals of one school community, not pro sports. All odds come from the pool, not a bookmaker.

## Operating Context

- Mobile-first web / PWA. Phone in one hand, short sessions, often opened from a link shared in a group chat.
- Content is user-generated: bets are created by students about campus events.
- Virality loop: create a bet → share a link/card → friends join to stake → result → bragging rights.

## Capabilities and Constraints

- Stakes are real money (wallet, deposit, withdraw). The user owns legal and compliance work; the product surfaces must leave room for it (age/identity verification, limits, terms) without designing it yet.
- Current phase: skeleton with near-final design and structure. Business logic (settlement, payments, resolution, moderation) comes later.
- Interface language: English.
- Undecided: currency and region, how an outcome gets resolved (who confirms it), how a user's school membership is verified, fee model.

## Brand Commitments

- Name: **Hunchpot** (hunchpot.com was unregistered at the time of naming).
- The user's binding visual reference: Bump-like (big typography with outlines, unusual shapes, gradients with a 3D feel), but less loud.
- Custom icons drawn by script, all in one distinctive style.
- Minimal button text; everything placed where the hand expects it.

## Evidence on Hand

None. No users, testimonials, schools, statistics or partners exist yet; do not fabricate them. Demo content in the skeleton is clearly placeholder.

## Product Principles

1. One thumb, zero reading: every core action (stake, create, share) is reachable and understandable without a label.
2. The pot is the story: odds, pool size and who is in should be the most visible things on any bet.
3. Sharing is the default exit, not an afterthought: every bet is built to be sent.
4. Your campus first: everything is scoped to the user's school community.
5. Come back for the result: every bet a user joins gives them a reason to return.

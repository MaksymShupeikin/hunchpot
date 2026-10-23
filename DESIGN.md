---
name: Hunchpot
description: Call it before it happens. Campus bets with friends.
colors:
  void: "#0e0e12"
  raised: "#17171f"
  raised-2: "#20202a"
  line: "#ffffff1f"
  text: "#ffffff"
  text-2: "#cfcedb"
  text-3: "#a3a1b6"
  mint: "#1e9e8c"
  mint-hi: "#6bebd6"
  mint-lo: "#0b5148"
  mint-br: "#3fd8bf"
  coral: "#c23b5b"
  coral-hi: "#ff8aa2"
  coral-lo: "#651428"
  coral-br: "#ff5a7a"
  butter: "#c08a1a"
  butter-hi: "#ffd772"
  butter-lo: "#5f4106"
  butter-br: "#ffc24b"
  iris: "#5646c8"
  iris-hi: "#a99eff"
  iris-lo: "#251b6c"
  iris-br: "#8b7bff"
typography:
  display:
    fontFamily: "Dela Gothic One, sans-serif"
    fontSize: "clamp(38px, 12cqi, 54px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Dela Gothic One, sans-serif"
    fontSize: "clamp(28px, 8.4vw, 40px)"
    fontWeight: 400
    lineHeight: 1
  numeral:
    fontFamily: "Dela Gothic One, sans-serif"
    fontSize: "clamp(64px, 22vw, 96px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Dela Gothic One, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.08
  body:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "tnum"
  label:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.04em"
rounded:
  tag: "8px"
  control: "16px"
  plate: "20px"
  card: "22px"
  sheet: "28px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "28px"
  nav: "76px"
  app-width: "480px"
components:
  outcome-button:
    backgroundColor: "{colors.mint-br}"
    textColor: "{colors.void}"
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "0 16px 0 18px"
    height: "64px"
  outcome-button-disabled:
    backgroundColor: "{colors.raised-2}"
    textColor: "{colors.text-3}"
  chip:
    backgroundColor: "{colors.raised-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "44px"
  chip-pressed:
    backgroundColor: "{colors.text}"
    textColor: "{colors.void}"
  button-solid:
    backgroundColor: "{colors.text}"
    textColor: "{colors.void}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  stake-sheet:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.sheet}"
    width: "480px"
  bet-row:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.card}"
    padding: "14px 16px 16px"
  nav-bar:
    backgroundColor: "{colors.void}"
    textColor: "{colors.text-3}"
    height: "76px"
  rail-button:
    backgroundColor: "#0e0e1280"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    size: "52px"
---

# Design System: Hunchpot

## Overview

**Creative North Star: "The Screen Is the Pot"**

Every bet owns the whole phone viewport like a vertical video, and its full-bleed media is the pool itself: one lit, shaded colour field per outcome, the seams sitting at the exact money split. The world is a dark void ground (no light mode; `color-scheme: dark`) carrying saturated 3D-lit colour, white type, and huge uppercase display words, one of which is always drawn in outline. Loud the way a sticker sheet is loud, then pulled back: a heavy bottom scrim, grain, and plenty of void keep it below Bump-level volume.

Density is one thing per screen on the feed (hard scroll-snap, one bet per viewport) and calm stacked cards on the scrolling tabs (Pocket, Rank, Me). Everything lives in a single centred phone column up to 480px wide, even on desktop. Actions sit at thumb height, and labels are kept to a minimum. Colour carries meaning by position, icons are drawn by a script in one two-plate style, and the stake is committed by a slide gesture instead of a tap.

**Key Characteristics:**
- Void ground, four positional outcome hues, each lit with highlight/base/shade.
- Dela Gothic One display in uppercase; exactly one outlined word per question.
- Full-bleed pot-split field with glossy seams and print grain, with nothing drawn over it. After a stake the seams glide to the new split.
- The pot and the time left are the loudest numbers after the question.
- Two-plate icons: tinted body offset under a round white stroke.
- Slide-to-stake: the chosen side's field floods the sheet as the puck travels.

## Colors

A void-dark neutral stack under four saturated, 3D-lit outcome hues that are assigned by position, not by meaning.

### Primary
- **Mint Field** (base, hi, lo, br): outcome 0. Also the app's caret, selection, `accent-color`, the share tint, the Feed nav tint, and the "won" result colour.

### Secondary
- **Coral Field** (base, hi, lo, br): outcome 1. Also the Me nav tint, the time-left clock tint, the urgent time chip, and (hi) error and "lost" text.

### Tertiary
- **Butter Field** (base, hi, lo, br): outcome 2. Also the focus ring (`2.5px solid` butter-br, `3px` offset), and the coin tint on balances.
- **Iris Field** (base, hi, lo, br): outcome 3. Also the Pocket nav tint.

### Neutral
- **Void**: page ground, scrim terminus, text on any lit colour surface.
- **Raised / Raised 2**: cards and the sheet / chips, tracks, disabled outcomes, close buttons.
- **Hairline** (`line`): the nav's top border, the only standing rule line.
- **Text / Text 2 / Text 3**: primary type / bylines and secondary values / section labels, inactive nav, data labels.

### Named Rules
**The Positional Hue Rule.** Outcome colour is the outcome's index mod 4: o0 mint, o1 coral, o2 butter, o3 iris. A hue never means yes, no, win, or lose. Each hue comes as four stops with fixed jobs: `base` is the field body, `hi` the radial highlight, `lo` the shade, and `br` (bright) the buttons, pills, chips, floods and tints. Field gradients use hi → base → lo. Buttons and tints use br.

**The Lit Colour Rule.** Large colour areas are never flat fills. A field, puck, outcome button or sheet flood is shaded with a highlight at the upper left and a shade at the bottom. Flat colour is kept for small marks (tags, the "mine" pill, the result bar).

## Typography

**Display Font:** Dela Gothic One (with sans-serif), weight 400 only
**Body Font:** Onest (with system-ui, sans-serif), tabular numerals throughout

**Character:** A blunt, wide display face set in uppercase that shouts the question, paired with a round, friendly grotesque used mostly at 700–800 for every label and control.

### Hierarchy
- **Display** (400, size by length, line-height 1, -0.01em, uppercase, balanced wrap): the bet question over the field. Short questions (under 40 chars) use clamp(38px, 12cqi, 54px), medium (under 80) clamp(31px, 9.6cqi, 42px), long clamp(25px, 7.6cqi, 32px). The result is then capped so the longest word fits one line: `min(size, (100cqi - 96px) / (longest-word-length × 0.86))`.
- **Numeral** (400, clamp(64px, 22vw, 96px), outlined 2px): the stake amount and the Pocket balance (clamp(52px, 17vw, 76px)). The Win payout uses 36px outlined in the side's colour (1.5px). Odds multipliers on buttons use 26px solid (21px when there are more than two sides).
- **Headline** (400, clamp(28px, 8.4vw, 40px), uppercase): tab page titles. The empty feed title uses 46px.
- **Title** (400, 19px/1.08, uppercase, two-line clamp): question text in bet rows.
- **Body** (400–600, 14–16px, 1.2–1.4): bylines and helper text.
- **Label** (800, 13–16px, 0.02–0.12em, uppercase on controls): outcome names, chips, CTAs, slide-track text (13px, 0.12em), data labels (11px, 0.1em, Text 3), section titles (13px, 0.1em, Text 3).

### Named Rules
**The One Outlined Word Rule.** Each display question strokes exactly one word: the longest word after the first (if the question is one word long, that word). The outline is `color: transparent` with a `0.045em` white text stroke. No other word in the question is outlined, and the words do not alternate. Because that word has to read as one unbroken outline, the display size is capped so the longest word fits on one line.

**The Outlined Money Rule.** The amount you are moving or holding (stake amount, Pocket balance, potential win) is set in outlined display numerals. Prices and odds on buttons stay solid.

## Layout

The app is a single centred phone column, `min(100%, 480px)`, on void, at every viewport width. The feed is a `100dvh` scroll container with mandatory y-snap and `scroll-snap-stop: always`, one bet per screen, with its scrollbar hidden. A fixed top bar puts the Hot / New / Closing text tabs on the left, the first label aligned with the question below (active tab underlined 3px, offset 8px), and the balance pill on the right. There is no logo or crest in the bar. The content block on a bet is anchored to the bottom, with 16px side padding and 12px gaps, ending above the 76px nav plus the bottom safe area. The content block stacks: a head row (question and byline on the left, a 52px share button on the right, bottom-aligned (no per-bet reminder: result notifications will come automatically for bets you are in)), then a full-width stats row, the "mine" chip, and the outcome buttons. The byline separates host and crowd by position and form: the host on the left as a tag (white at 12% pill, 26px avatar, 800 14px handle, ellipsis when long), the crowd on the right as an avatar group (the latest three stakers at 26px, overlapping 8px with a void ring, then a "+N" bubble in raised-2 for everyone else). No dot or "in" text between them. The stats row carries the pot (Dela amount up to 36px and a small "POT" label, no icon) on the left and the time left on the right as a white Dela 17px chip with a clock; under an hour left the chip turns coral-br. The pot reads in whole dollars and goes compact from $10k ("$12.4K"), so it never passes 7 characters, and its numeral shrinks to the space left of the chip; the chip never shrinks. Your position, when you are in an open bet, lives inside your own outcome button instead of its odds: the side label drops to 12px at 75% on top, and under it "stake → payout" in 800 up to 17px, sized to the button (amounts longer than 7 characters go whole-dollar or compact). The other sides keep their odds and are disabled; tapping your side still opens the sheet to add more. A bet that is over says so three ways: the time chip becomes a muted "Ended" chip (raised-2, text-2, check icon once settled, clock while waiting); the fields of losing sides, or every side while waiting, are shaded with void at 62%, so only the winner stays lit; and the outcome buttons give way to the result bar ("<side> won" on the winner's br with "YOU +$4.66" on the right, or a raised "Waiting for result"). Tapping the host tag or the crowd group opens the crowd sheet, built from the stake sheet itself (same dialog, same top edge, same close circle). Its header pill is the stake sheet's pick pill in white (everyone, not one side; butter would read as the third outcome): who first, a two-plate people icon and the head count in 800 15px, then the pot in Dela 18px, the same who-then-money order as the side heads below. Below it: the host's profile (56px avatar with a two-plate crown on a void disc at its lower right, Dela name, handle; no label, no record), set apart by a 1px line-colour hairline, then one section per side (a br side tag, that side's pot, and the head count in grey with the same people icon, its plate in the side's colour) listing each person as a raised-2 row with avatar, name or "You" (outlined in the side colour), handle, and the amount in Dela 20px, biggest first. The list has no bottom padding on the sheet: it runs to the bottom edge of the screen and scrolls there, with the safe area added inside the scroll. It loads on open and offers "Try again" if loading fails. While any sheet is open the feed under it is locked, and sheets contain their own overscroll. Both sheets carry a 2.5px top edge in the sheet's own colour (the chosen side's br on the stake sheet, white on the crowd sheet, never butter, which belongs to the third outcome and the focus ring) and take focus themselves when they open, so no control starts out ringed. Signing in uses the composer's full-bleed screen: the brand mark top left (lid in white), a close circle top right that returns to where the visitor was (sign-in is never a wall), a Dela headline with one outlined word ("Call it on your campus", "Check your inbox", "Not on the map yet"), a raised email field ringed in mint on focus, a white CTA, and the 6-digit code as one outlined Dela field with a mint underline that submits itself when full. A waitlisted campus shows the same full-bleed field as its progress: mint is the share of students who joined out of the number that opens it, with "<campus> opens at <n>" and an Invite button. Guests browse freely: the feed keeps its tabs with a "Sign in" pill where the balance would be. Sign-in is asked only at the moment it is needed: a guest tapping a side gets the sign-in form in a sheet over the bet (the stake sheet's dialog, edge and pick pill tinted with that side, headline "Sign in to bet"), and once the code checks out the stake sheet opens on the same side without leaving the feed. Pocket and Me show a quiet prompt (Dela headline, one line, a white Sign in button) instead of redirecting; only publishing a bet sends a guest to the sign-in screen first. One dot cue for the whole feed (5px dots, current stretched to 18px, window of 7) is fixed at the right edge under the balance pill, with the same 14px inset, overlaid like the top bar, and follows the scroll.

Scrolling tabs use 16px side padding and 28px gaps between sections. Display sizes scale by container width (`cqi`) inside the bet screen and composer. Safe-area insets are respected at the top and bottom.

## Elevation & Depth

Depth comes from light, not from layered surfaces: radial highlights, inset gloss and soft drop shadows below lit objects. The neutral surfaces (void, raised, raised-2) stay flat. A heavy vertical scrim (void at 70% alpha at the top, clear through the middle, then 77% → 94% → solid towards the bottom) is what makes text sit over the fields.

### Shadow Vocabulary
- **Lit-button gloss** (`inset 0 2px 0 #ffffff8c, inset 0 -3px 0 #0000002e, 0 12px 20px -12px #000`): outcome buttons. The Create button uses the same recipe.
- **Puck** (`0 6px 12px -4px #000b`): the slide-to-stake puck.

### Named Rules
**The Grain Rule.** The pot field always carries fractal-noise grain (opacity 0.28, overlay blend) above its fields and shapes, so the media reads as printed material rather than a CSS fill.

## Shapes

Every shape is soft. Pills (999px) are used for chips, tags, tracks, the balance and time chips, and the "mine" marker. Rounded plates are 20px (outcome and result buttons), 22–24px (cards and empty states), 16–18px (CTAs, nav items, Create) and 28px on the stake sheet's top corners. Circles are used for avatars (lit spheres in the user's hue), rail buttons, the puck, and close buttons. The only straight geometry is the field seams. They run vertically and bow along an S-curve that leans left or right per bet (from a seed based on the bet id). Each seam is drawn as a 22px dark stroke under a 2px white gloss line, so it reads as a glossy fold.

## Components

### Outcome Buttons
A lit pill in the outcome's bright hue: the bottom edge of its field.
- **Shape:** 20px radius, 64px tall (54px when there are more than two sides), two-column grid with a 10px gap.
- **Fill:** a vertical gradient from br mixed 62% with white, through br, to br mixed 72% with black, with the lit-button gloss. Void text. Uppercase 800 label on the left, solid display multiplier on the right.
- **States:** press scales to 0.96 and moves down 1px (0.3s ease-out). Disabled (locked to your other side) goes flat raised-2 with Text 3 and no shadow.

### Pot Field (signature)
The bet's full-bleed media. One SVG path per outcome, filled with a radial gradient (hi → base → lo, centre 30%/22%). Each field's width is its share of the pot, with a minimum visible sliver of 8%. Seams are glossy. Nothing is drawn over the fields, neither shapes nor numbers; the width is the information, and anything on top pulls attention from the question. The screen-level scrim only darkens the top 15% for the top bar. The text block brings its own shade: a gradient on the content block that starts 160px above the first line of the question (void at 0 → 58% at 90px → 82% at 160px → 95% → void), so a long question that starts high is as readable as a short one, and the question carries a soft void text shadow. Questions are capped at 70 characters (API `question_max`, composer `maxLength`); the composer shows the characters left from 20, coral from 5, and steps its type down at 32 and 52 characters like the feed. On the bet screen the question column is its own size container and the type is capped so the longest word fits it (`100cqi / (len × 0.95)`), so no word reaches the rail. Fields and seams are drawn at x=0 and placed with `translateX`, so after a stake they glide to the new split over 0.9s ease-out; this works in Safari, where CSS `d` does not animate. The feed keeps bets in their first-seen order across that refresh. Grain goes over everything.

### Stake Sheet and Slide-to-Stake (signature)
A bottom `dialog` on raised, with 28px top corners. It rises in over 0.5s ease-out over a void backdrop at 76% alpha. The header holds a pick pill in br with the solid odds and a 44px close circle. Below it the stake amount is itself the input, empty when the sheet opens (a grey outlined 0 placeholder). The sheet rises first; when its rise animation ends the amount takes focus (without scrolling the sheet), ready to type: an outlined Dela numeral with a "$", an inline field that grows with what is typed (decimal keypad on phones; digits, one dot, two decimals), underlined in the side colour while focused. Directly under it a small "TO WIN" label and the payout in the same outlined numeral, stroked in the side colour; both share one size, set by the longer string so neither overflows (max 88px). Then the chips ($1, $5, $10, $20, Max). There is no balance line and no boxed Win / Balance panel. Under $1 or over the balance the stake turns coral-hi and the slider is disabled. The track is a 64px raised-2 pill holding a 56px lit puck (a white-to-br radial). As the puck travels, a br-tinted flood (55% mixed into raised-2) grows behind it. At the same time the chosen side's lit field (hi → base → lo) rises from the bottom of the sheet through a `clip-path` driven by `--p`, and the Win figure counts up from the stake to the payout. Releasing past 90% commits the stake, and anything less springs back (0.4s ease-out). A tap never stakes. Enter or Space confirms from the keyboard. While pending, the puck pulses.

### Chips
- **Style:** 44px raised-2 pills, minimum width 60px, 800 15px.
- **State:** pressed inverts to a white fill with void text. Disabled drops to 0.35 opacity.

### Cards / Bet Rows
- **Corner Style:** 22px.
- **Background:** raised, and raised-2 on hover (hover-capable devices only). Press scales to 0.98.
- **Content:** display title (19px, two lines), a 12px pill-shaped split bar in the outcome hues, and an 800 13px footer. Won results use mint-br, lost results coral-hi.

### Inputs / Fields
The composer question is borderless display type (clamp(34px, 11cqi, 48px)) on void. Its placeholder is outlined (a 1.5px white stroke at 65%) instead of greyed. Other fields use the global focus ring.

### Navigation
A fixed 76px void bar with a hairline top border, centred in the column, carrying four 56px icon items and a raised Create button in the middle. Each item has its own tint (Feed mint, Rank butter, Pocket iris, Me coral). At rest the icon is Text 3 with its tint at 45%. When current, the icon is white with its full tint. Create is a 64×46 two-field pill: mint and coral split at 48/52%, glossed, with a 3px-stroke plus. Press scales items to 0.9.

### Icons (signature)
Generated by `web/scripts/icons.mjs` on a 24px grid. Never hand-edit `Icon.tsx`, and never mix in another icon set. Each glyph has two plates: a body shape filled with `--icon-tint`, offset +1.6px / +1.6px, under a 2px round-cap, round-join `currentColor` outline. Together they read like a slightly misregistered two-colour print. Every context that shows a bodied glyph sets a tint: nav items (per item), rail (remind butter, share mint), balance coin (butter), time chip (coral), categories (per category), result (white at 40%). Line-only glyphs (close, back, slide, plus, create) have no body plate.

## Do's and Don'ts

### Do:
- **Do** pick an outcome's colour by its index mod 4, and use base/hi/lo for fields and br for buttons, pills and tints.
- **Do** outline exactly one word per display question (the longest after the first), and cap the display size so that word fits one line.
- **Do** light every large colour area (highlight at the upper left, shade below) and lay grain over the pot field.
- **Do** draw new icons in `web/scripts/icons.mjs` as body plus outline plates, and set `--icon-tint` wherever a bodied icon appears.
- **Do** commit stakes with a slide gesture past 90%, with the side's field flooding the sheet.
- **Do** keep the 480px single column and the bottom-anchored, thumb-height action zone.

### Don't:
- **Don't** alternate solid and outlined words, or outline more than one word per question.
- **Don't** give hues fixed meanings (for example green for yes and red for no). Position assigns colour.
- **Don't** render the pot as a list of rows with Yes/No price pills. On a bet screen, the field split is the odds display.
- **Don't** fill large areas with flat outcome colour, or add a light theme.
- **Don't** put shapes or numbers over the fields; the question and the pot must win the screen.

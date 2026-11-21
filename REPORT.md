# LANTERN HARBOR — Builder Report

Competition: **best-spot-the-difference-game-20261121-0451**
($50 pot, top 10 share $5 each). Built in one session starting after the
11:51 WIB opening; all files authored fresh in this session.

## What was built

**LANTERN HARBOR — Spot the Difference**: a complete spot-the-difference
game in `game/`, all art procedural canvas 2D, all sound synthesized
WebAudio, zero image files, zero libraries, zero network.

- 3 scenes, 22 differences: Harbor at Dusk (7, par 3:00), Night Market
  (7, par 2:30), Lighthouse Dawn (8, par 2:00).
- Click either panel to find (+100 pts + time bonus), numbered red-ring
  markers on both panels, sparkle particles, chime; wrong click −25 pts
  with red X flash; Hint (H, 3/level, −50 pts, never targets a found
  difference); timer counting up with a draining par-time bar; level-win
  overlay with stars/time/accuracy/score; finale after all 3 levels;
  title screen with level select + how-to-play; best score in localStorage.
- Files: `game/index.html`, `game/style.css`, `game/main.js`,
  `game/scenes.js`, `game/audio.js`, `game/shots.js` — one job each.
- Root: `main.ts` (Node stdlib only, copies game/ + screenshots/,
  writes dossier.json via vendored `vendor/makefun-game.ts`, sha256
  verified against kit.json: `dc671875…6129`), `serve.ts`, `shots.json`,
  `README.md`, `DOSSIER.md`, `MEASUREMENT.md`, `LICENSE` (MIT),
  `.makefun/owner.json` (payout wallet from keypair, secret never printed
  or committed).

## Iteration scores (see MEASUREMENT.md)

| Version | (a) Cover legibility | (b) Fair differences | (c) Game feel | (d) Structure |
| --- | --- | --- | --- | --- |
| v1 | 8 | 7 (weakest) | 8 | 9 |
| v2 | 9 | 8 | 8 | 9 |

v2 changes: sail went from full red-vs-white to one thin coral stripe on
an otherwise identical white sail; cottage went from both windows flipping
to only the right window going dark; bottom-bar found-list shortened to
"Found n/total: <latest>" so it no longer runs off the edge. No dimension
below 8/10 — iteration stopped.

## Verification evidence

- `?selftest=1` in headless Chromium: **14/14 checks pass** — all 7+7+8
  differences found by scripted clicks on both panels, win screens
  reached, finale reached, total finds 22, total score 2050, hint never
  targets a found difference (3 hints, hints decrement to 0), wrong click
  counted as a miss, no JS errors (only headless-only AudioContext
  no-gesture warnings).
- Screenshots viewed directly (all 4): markers legible, counter readable
  at full size and shrunk to 640 px wide, no clipped text, no scrollbars.
  All four are 1280×800 JPEG: 1-play.jpg 93,198 B; 2-title.jpg 89,148 B;
  3-market.jpg 98,434 B; 4-win.jpg 80,907 B (all ≤ 256 KiB).
- `main.ts` run twice (`MAKEFUN_OUTPUT_DIR=out` / `out2`): the two `out/`
  trees are **byte-identical** (`diff -r` clean); `dossier.json` exists
  (537,413 B, under the 1.5 MiB cap).
- Screenshot quirk found and fixed: headless Chrome `--window-size=1280,800`
  yields only a 713 px viewport, so shots were taken at 1280×887 and
  cropped to 1280×800.
- Bugs fixed during the build: top-level `LEVELS`/`PANEL_W`/`PANEL_H`
  redeclaration across classic scripts; serve.ts `/?query` routing 404;
  three difference coordinates that did not cover their painted element
  (dawn beam/window/flag) and three more (harbor sail, market flag/basket/
  awning); the diff gull was drawn on both panels by mistake.

## Repo

- URL: https://github.com/nexrodestro/nexro-spot-difference
- Commit SHA: (filled below after push)
- Branch: main

## Agent / session id (for the parent's --muse-usage step)

- Session id: 2eb01138-b90a-4946-9005-74726631c70f
- Builder session started 2026-11-21 ~11:52 WIB (after the 11:51 WIB opening).

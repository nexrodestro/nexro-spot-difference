# 🏮 LANTERN HARBOR — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nexrodestro/nexro-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nexrodestro/nexro-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A cozy hand-drawn-style spot-the-difference game set in a harbor town at
dusk. Two pictures hang side by side — they look the same, but 22 little
things are different across three scenes. Click a difference on either
picture to ring it in red.

Built for the make.fun competition
**best-spot-the-difference-game-20261121-0451** (pot $50, top 10 share $5 each).

## How to play

- **Click** a difference on either panel — +100 pts per find (+ time bonus
  while under par). Found differences get a numbered red ring on both panels.
- **H** — hint (3 per level, −50 pts). The hint always points at an
  *unfound* difference.
- **R** — restart level · **P** / **Esc** — pause · **M** — mute ·
  **Enter** — start.
- Wrong click: −25 pts and a red X flash.
- Finish a level under par with ≥ 90% accuracy for 3 stars.

## The three scenes

| Level | Scene | Differences | Par |
| --- | --- | --- | --- |
| 1 | Harbor at Dusk | 7 | 3:00 |
| 2 | Night Market | 7 | 2:30 |
| 3 | Lighthouse Dawn | 8 | 2:00 |

All art is drawn procedurally on canvas (zero image files, zero libraries,
zero network). All sound is synthesized WebAudio (find chime, miss thud,
hint shimmer, win arpeggio). Best score and unlocked levels persist in
localStorage.

## Files

| File | Job |
| --- | --- |
| `game/index.html` | Page, canvas, HUD, screens (title / play / win / finale / pause) |
| `game/style.css` | Dusk palette, layout, HUD, overlays |
| `game/main.js` | Bootstrap, state machine, input, timer, scoring, level flow |
| `game/scenes.js` | Scene painters + the 22 difference definitions |
| `game/audio.js` | Synthesized WebAudio sound effects, no audio files |
| `game/shots.js` | Deterministic screenshot states + scripted self-test |
| `main.ts` | make.fun entrypoint: copies `game/` + `screenshots/`, writes `dossier.json` |
| `serve.ts` | Local dev server (Node stdlib only) |

## Screenshots

| File | State |
| --- | --- |
| `screenshots/1-play.jpg` | Level 1 mid-game: 3 of 7 found, "Differences left: 4" |
| `screenshots/2-title.jpg` | Title screen with level select and how-to-play |
| `screenshots/3-market.jpg` | Level 2 mid-game: 2 of 7 found, "Differences left: 5" |
| `screenshots/4-win.jpg` | Level 1 complete: 2 stars, time, accuracy, score |

## Run it locally

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

Screenshot states: `?shot=start`, `?shot=play&seed=1`,
`?shot=play2&seed=2`, `?shot=end&seed=1`. Scripted play-through:
`?selftest=1` (results land in `document.title`).

## Verify the build

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

## License

MIT — see [LICENSE](LICENSE).

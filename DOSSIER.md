# LANTERN HARBOR — Dossier

## Game

**LANTERN HARBOR — Spot the Difference.** A cozy harbor town at dusk,
drawn entirely in procedural canvas 2D (no image files, no libraries, no
network). Three scenes, 22 differences in total, difficulty rising level
by level. Click a difference on either panel to ring it in red on both;
finish all three scenes for the finale.

## Controls

- Mouse click on either panel — find a difference (+100 pts, + time bonus
  under par); wrong click −25 pts, red X flash.
- H — hint, 3 per level, −50 pts; never points at a found difference.
- R — restart level. P / Esc — pause. M — mute. Enter — start.
- Level complete → stars (3 = under par with ≥ 90% accuracy), time,
  accuracy, score, Next Level / Replay. All 3 levels → finale screen with
  total score, total time, Play Again. Best score in localStorage.

## Files (game/, one clear job each)

- `index.html` — page, canvas, HUD, screens.
- `style.css` — dusk palette (deep teal, warm amber), layout, overlays.
- `main.js` — bootstrap, state machine, input, timer, scoring, level flow.
- `scenes.js` — scene painters (Harbor / Market / Dawn) + 22 difference
  definitions `{id, x, y, r, label}`; left panel paints the base, the right
  panel paints base + mutations. Click radius ≥ 22 px.
- `audio.js` — synthesized WebAudio SFX (chime, thud, shimmer, win
  arpeggio, ticks), no audio files.
- `shots.js` — deterministic `?shot=` states + `?selftest=1` scripted
  play-through driver.

## Screenshots

1. `1-play.jpg` — Level 1 mid-game, 3 of 7 found, numbered red-ring markers
   on both panels, 4 unfound, "Differences left: 4" in the HUD.
2. `2-title.jpg` — title screen, level select, how-to-play.
3. `3-market.jpg` — Level 2 mid-game, 2 of 7 found, "Differences left: 5".
4. `4-win.jpg` — Level 1 complete overlay: 2 stars, 1:36, 88% accuracy, 740.

All four are 1280×800 JPEG, each under 256 KiB.

## Verification

- `?selftest=1` in headless Chromium: 14/14 checks pass — all 7 + 7 + 8
  differences found by scripted clicks on both panels, win screens reached,
  finale reached, total finds 22, hint never targets a found difference
  (3 hints), wrong click counted as a miss, no JS errors.
- `main.ts` run twice with `MAKEFUN_OUTPUT_DIR=out`: the two `out/` trees
  are byte-identical; `dossier.json` exists.
- Screenshots viewed directly: markers legible, counter readable at full
  size and shrunk to 640 px wide, no clipped text, no scrollbars.

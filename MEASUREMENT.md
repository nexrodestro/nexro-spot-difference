# MEASUREMENT — LANTERN HARBOR iteration log

Scores 0–10 on: (a) cover legibility at 1280×800 AND shrunk to ~640 px wide,
(b) differences fair-but-not-obvious, (c) game feel, (d) code structure.

## v1 (2026-11-21 ~12:00 WIB)

- (a) 8 — counter "Differences left: 4" big and legible, numbered red rings
  clear at full size and at 640 px. But: headless `--window-size=1280,800`
  gave a 713 px viewport, so the first shots showed a scrollbar and a cut
  bottom bar (fixed by shooting at 1280×887 and cropping to 1280×800).
- (b) 7 — WEAKEST. The sail was a full red-vs-white change and the cottage
  had BOTH windows flip — both shout the answer on first glance.
- (c) 8 — markers satisfying, timer + draining par bar visible, score and
  hint button clear. Found-list in the bottom bar ran off the right edge.
- (d) 9 — six game files, one job each, named for what they do.

Self-test v1: 14/14 checks pass (22 finds, finale, hint never targets
found, wrong click = miss, no JS errors).

## v2 (2026-11-21 ~12:05 WIB) — fixed the weakest dimension (b)

- Sail: full red sail → same white sail with one thin coral stripe on the
  right panel only (label: "A stripe appeared on the sail").
- Cottage: both windows flipping → only the RIGHT window of the big cottage
  goes dark; the left window stays lit.
- Bottom bar: found-list now shows "Found n/total: <latest find>" instead
  of the full list, so it no longer runs off the edge.

Re-measured v2:

- (a) 9 — cover still fully legible at 640 px; bottom bar now fits.
- (b) 8 — stripe and single-window changes are fair but need a real look;
  buoy stripe and crate count stay as the easy/medium mix.
- (c) 8 — unchanged; timer pressure visible, markers satisfying.
- (d) 9 — unchanged.

No dimension below 8/10 — iteration stops here.

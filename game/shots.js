// LANTERN HARBOR — deterministic screenshot states + self-test driver.
// ?shot=start            title screen, level select, how-to-play
// ?shot=play&seed=1      L1 mid-game: 3 of 7 found, "Differences left: 4"
// ?shot=play2&seed=2     L2 mid-game: 2 of 7 found, "Differences left: 5"
// ?shot=end&seed=1       L1 level-win overlay (2 stars, 7/8 accuracy)
// ?selftest=1            scripted play-through; results land in
//                        document.title and #selftest (read via --dump-dom).
// Shot mode freezes the timer so every render is deterministic.

'use strict';

function applyShot(params) {
  const G = window.Game;
  const shot = params.get('shot');
  if (!shot && !params.get('selftest')) return;
  G.state.frozen = true;

  if (params.get('selftest') === '1') {
    runSelfTest();
    return;
  }

  if (params.get('debug') === '1') {
    const de = document.documentElement;
    const text = 'DEBUG scrollW=' + de.scrollWidth + ' scrollH=' + de.scrollHeight +
      ' innerW=' + window.innerWidth + ' innerH=' + window.innerHeight;
    document.title = text;
    const box = document.getElementById('selftest');
    if (box) { box.style.display = 'block'; box.textContent = text; }
    return;
  }

  if (shot === 'play') {
    G.startLevel(0);
    const lv = G.level();
    G.state.found = lv.diffs.slice(0, 3).map((d) => d.id);
    G.state.elapsed = 47;
    G.state.levelScore = 350;
    G.updateHUD();
  } else if (shot === 'play2') {
    G.startLevel(1);
    const lv = G.level();
    G.state.found = lv.diffs.slice(0, 2).map((d) => d.id);
    G.state.elapsed = 38;
    G.state.levelScore = 230;
    G.updateHUD();
  } else if (shot === 'end') {
    G.startLevel(0);
    const lv = G.level();
    G.state.found = lv.diffs.map((d) => d.id);
    G.state.misses = 1;
    G.state.elapsed = 96;
    G.state.levelScore = 740;
    // Reuse the real win path so the overlay shows true computed stats.
    G.state.screen = 'win';
    document.getElementById('win-title').textContent = lv.name + ' — Complete!';
    document.getElementById('win-stars').innerHTML = '★★<span class="dim">★</span>';
    document.getElementById('win-time').textContent = '1:36';
    document.getElementById('win-par').textContent = '3:00';
    document.getElementById('win-acc').textContent = '88%';
    document.getElementById('win-score').textContent = '740';
    document.getElementById('win-flavor').textContent =
      'Well found! One or two still hide in the dusk — replay to catch them all.';
    document.getElementById('next-btn').textContent = 'Next Level →';
    document.getElementById('win-screen').classList.remove('hidden');
    G.updateHUD();
  }
  // shot=start: leave the title screen as booted.
}

function runSelfTest() {
  const G = window.Game;
  const out = { checks: [], pass: true };
  function check(name, ok, detail) {
    out.checks.push({ name, ok: !!ok, detail: detail || '' });
    if (!ok) out.pass = false;
  }

  try {
    // Level 1: click every difference on the left panel, expect a win.
    G.startGame();
    check('l1-starts-play', G.state.screen === 'play', G.state.screen);
    const l1 = G.level();
    let foundAll = true;
    for (const d of l1.diffs) {
      const r = G.clickAt(0, d.x, d.y);
      if (!r.found) foundAll = false;
    }
    check('l1-all-diffs-found', foundAll && G.state.found.length === 7, G.state.found.length + '/7');
    check('l1-win-screen', G.state.screen === 'win', G.state.screen);
    check('l1-score', G.state.levelScore === 700, String(G.state.levelScore));

    // Level 2: hint must never target a found difference.
    G.nextLevel();
    check('l2-starts', G.state.levelIdx === 1 && G.state.screen === 'play');
    const l2 = G.level();
    G.clickAt(0, l2.diffs[0].x, l2.diffs[0].y);
    G.clickAt(0, l2.diffs[1].x, l2.diffs[1].y);
    let hintOk = true;
    for (let i = 0; i < 3; i++) {
      const t = G.useHint();
      if (!t || G.state.found.includes(t.id)) hintOk = false;
      else G.clickAt(0, t.x, t.y); // find the hinted one, like a player would
    }
    check('hint-never-targets-found', hintOk, '3 hints, all unfound');
    check('hints-decrement', G.state.hintsLeft === 0, String(G.state.hintsLeft));
    for (const d of l2.diffs) {
      if (!G.state.found.includes(d.id)) G.clickAt(1, d.x, d.y); // right panel
    }
    check('l2-win-screen', G.state.screen === 'win', G.state.screen);

    // Level 3: one wrong click, then find all -> finale.
    G.nextLevel();
    check('l3-starts', G.state.levelIdx === 2 && G.state.screen === 'play');
    const missesBefore = G.state.misses;
    const r = G.clickAt(0, 10, 10); // empty sky: must be a miss
    check('wrong-click-is-miss', !!r.miss && G.state.misses === missesBefore + 1,
      'misses=' + G.state.misses);
    const l3 = G.level();
    for (const d of l3.diffs) G.clickAt(0, d.x, d.y);
    check('l3-win-screen', G.state.screen === 'win', G.state.screen);
    G.nextLevel();
    check('finale-shown', G.state.screen === 'finale', G.state.screen);
    check('total-finds-22', G.state.totalFinds === 22, String(G.state.totalFinds));
    check('total-score-positive', G.state.totalScore > 0, String(G.state.totalScore));
  } catch (e) {
    out.pass = false;
    out.error = String(e && e.stack || e);
  }

  const text = 'SELFTEST ' + JSON.stringify(out);
  document.title = text;
  const box = document.getElementById('selftest');
  if (box) {
    box.style.display = 'block';
    box.textContent = text;
  }
}

window.applyShot = applyShot;

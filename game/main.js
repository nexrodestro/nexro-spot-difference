// LANTERN HARBOR — bootstrap, state machine, input, timer, scoring.
// Panels: left x=10, right x=650, both y=34, 620x640 (scene space = panel
// space, so difference coordinates map 1:1). Clicks on either panel count.

'use strict';

const Levels = window.LanternHarbor.LEVELS;
const PW = window.LanternHarbor.PANEL_W;
const PH = window.LanternHarbor.PANEL_H;
const PANEL_Y = 34;
const PANEL_X = [10, 650];
const TOTAL_DIFFS = Levels.reduce((n, l) => n + l.diffs.length, 0); // 22

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const el = (id) => document.getElementById(id);
const $ = {
  levelName: el('level-name'), timer: el('timer'), par: el('par'),
  parFill: el('parbar-fill'), score: el('score'), leftN: el('left-n'),
  hintsN: el('hints-n'), hintBtn: el('hint-btn'), muteBtn: el('mute-btn'),
  pauseBtn: el('pause-btn'), foundList: el('found-list'),
  title: el('title-screen'), win: el('win-screen'), finale: el('finale-screen'),
  pause: el('pause-screen'), levelRow: el('level-row'), bestLine: el('best-line'),
};

const state = {
  screen: 'title',        // title | play | win | finale | pause
  levelIdx: 0,
  found: [],              // diff ids, in find order
  misses: 0,
  hintsLeft: 3,
  levelScore: 0,
  totalScore: 0,
  totalMisses: 0,
  totalFinds: 0,
  elapsed: 0,             // seconds in current level
  totalElapsed: 0,
  paused: false,
  muted: false,
  unlocked: 1,            // levels unlocked (1-based count)
  hintTarget: null,       // diff id currently pulsing, or null
  hintUntil: 0,
  particles: [],          // {x, y, vx, vy, life, color}
  flashes: [],            // {x, y, life, kind: 'miss'}
  lastTick: 0,
  frozen: false,          // shot mode: timer does not advance
};

function loadMeta() {
  try {
    state.unlocked = Math.min(Levels.length, parseInt(localStorage.getItem('lantern-harbor-unlocked') || '1', 10) || 1);
  } catch (e) { /* storage unavailable: play unlocked level 1 only */ }
  try {
    state.best = parseInt(localStorage.getItem('lantern-harbor-best') || '0', 10) || 0;
  } catch (e) { state.best = 0; }
}

function saveMeta() {
  try {
    localStorage.setItem('lantern-harbor-unlocked', String(state.unlocked));
    localStorage.setItem('lantern-harbor-best', String(state.best));
  } catch (e) { /* ignore */ }
}

function fmt(sec) {
  const s = Math.max(0, Math.floor(sec));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function level() { return Levels[state.levelIdx]; }
function remaining() { return level().diffs.length - state.found.length; }
function accuracy() {
  const f = state.totalFinds + state.found.length;
  const m = state.totalMisses + state.misses;
  return f + m === 0 ? 1 : f / (f + m);
}

// ------------------------------------------------------------------ flow
function showOnly(name) {
  for (const [key, node] of [['title', $.title], ['win', $.win], ['finale', $.finale], ['pause', $.pause]]) {
    node.classList.toggle('hidden', key !== name);
  }
}

function buildLevelRow() {
  $.levelRow.innerHTML = '';
  Levels.forEach((lv, i) => {
    const b = document.createElement('button');
    b.className = 'level-btn';
    b.innerHTML = (i + 1) + '. ' + lv.name + '<small>' + lv.diffs.length +
      ' differences · par ' + fmt(lv.par) + '</small>';
    b.disabled = i >= state.unlocked;
    b.addEventListener('click', () => { SFX.blip(); startLevel(i); });
    $.levelRow.appendChild(b);
  });
  $.bestLine.textContent = state.best > 0
    ? 'Best score so far: ' + state.best + ' pts'
    : 'No best score yet — the harbor is waiting.';
}

function startLevel(i) {
  state.levelIdx = i;
  state.found = [];
  state.misses = 0;
  state.hintsLeft = 3;
  state.levelScore = 0;
  state.elapsed = 0;
  state.hintTarget = null;
  state.particles = [];
  state.flashes = [];
  state.screen = 'play';
  state.paused = false;
  showOnly(null);
  updateHUD();
}

function startGame() {
  state.totalScore = 0;
  state.totalMisses = 0;
  state.totalFinds = 0;
  state.totalElapsed = 0;
  startLevel(0);
}

function levelComplete() {
  const lv = level();
  state.totalFinds += state.found.length;
  state.totalMisses += state.misses;
  state.totalElapsed += state.elapsed;
  state.totalScore += state.levelScore;
  const acc = state.found.length / Math.max(1, state.found.length + state.misses);
  const stars = (state.elapsed <= lv.par && acc >= 0.9) ? 3
    : (state.elapsed <= lv.par * 1.5 && acc >= 0.75) ? 2 : 1;
  state.screen = 'win';
  el('win-title').textContent = lv.name + ' — Complete!';
  el('win-stars').innerHTML = '★'.repeat(stars) + '<span class="dim">' + '★'.repeat(3 - stars) + '</span>';
  el('win-time').textContent = fmt(state.elapsed);
  el('win-par').textContent = fmt(lv.par);
  el('win-acc').textContent = Math.round(acc * 100) + '%';
  el('win-score').textContent = state.levelScore;
  el('win-flavor').textContent = stars === 3
    ? 'A perfect sweep — every lantern in the harbor burns a little brighter.'
    : stars === 2
      ? 'Well found! One or two still hide in the dusk — replay to catch them all.'
      : 'Found them all, but the par time slipped away. The harbor forgives slow eyes.';
  el('next-btn').textContent = state.levelIdx < Levels.length - 1 ? 'Next Level →' : 'See the Finale →';
  showOnly('win');
  SFX.win();
  updateHUD();
}

function showFinale() {
  state.screen = 'finale';
  if (state.totalScore > state.best) {
    state.best = state.totalScore;
    saveMeta();
  }
  el('final-score').textContent = state.totalScore;
  el('final-time').textContent = fmt(state.totalElapsed);
  el('final-acc').textContent = Math.round(accuracy() * 100) + '%';
  el('final-best').textContent = state.best;
  showOnly('finale');
  SFX.win();
}

function nextLevel() {
  if (state.levelIdx < Levels.length - 1) {
    state.unlocked = Math.max(state.unlocked, state.levelIdx + 2);
    saveMeta();
    startLevel(state.levelIdx + 1);
  } else {
    showFinale();
  }
}

// ------------------------------------------------------------------ input
function panelCoords(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const x = (clientX - r.left) * (canvas.width / r.width);
  const y = (clientY - r.top) * (canvas.height / r.height);
  for (let p = 0; p < 2; p++) {
    if (x >= PANEL_X[p] && x < PANEL_X[p] + PW && y >= PANEL_Y && y < PANEL_Y + PH) {
      return { panel: p, x: x - PANEL_X[p], y: y - PANEL_Y };
    }
  }
  return null;
}

function findAt(lx, ly) {
  const lv = level();
  for (const d of lv.diffs) {
    if (state.found.includes(d.id)) continue;
    const dx = lx - d.x, dy = ly - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return d;
  }
  return null;
}

function burst(x, y) {
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + Math.random() * 0.5;
    const sp = 40 + Math.random() * 90;
    state.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30,
      life: 0.7 + Math.random() * 0.3,
      color: i % 3 === 0 ? '#ffd98a' : i % 3 === 1 ? '#e8b23a' : '#ffffff',
    });
  }
}

function onCanvasClick(e) {
  if (state.screen !== 'play' || state.paused) return;
  const pos = panelCoords(e.clientX, e.clientY);
  if (!pos) return;
  const d = findAt(pos.x, pos.y);
  if (d) {
    state.found.push(d.id);
    const bonus = Math.max(0, Math.round(50 * (1 - state.elapsed / level().par)));
    state.levelScore += 100 + bonus;
    state.hintTarget = null;
    for (const px of PANEL_X) burst(px + d.x, PANEL_Y + d.y);
    SFX.chime();
    if (state.found.length === level().diffs.length) levelComplete();
  } else {
    state.misses += 1;
    state.levelScore = Math.max(0, state.levelScore - 25);
    state.flashes.push({ x: pos.x, y: pos.y, panel: pos.panel, life: 0.5 });
    SFX.thud();
  }
  updateHUD();
}

function useHint() {
  if (state.screen !== 'play' || state.paused || state.hintsLeft <= 0) return null;
  const unfound = level().diffs.filter((d) => !state.found.includes(d.id));
  if (unfound.length === 0) return null;
  // Never point at a found difference: pick only from unfound.
  const target = unfound[Math.floor(Math.random() * unfound.length)];
  state.hintsLeft -= 1;
  state.levelScore = Math.max(0, state.levelScore - 50);
  state.hintTarget = target.id;
  state.hintUntil = performance.now() + 2000;
  SFX.shimmer();
  updateHUD();
  return target;
}

// ------------------------------------------------------------------ HUD
function updateHUD() {
  const lv = level();
  $.levelName.textContent = (state.levelIdx + 1) + ' · ' + lv.name;
  $.timer.textContent = fmt(state.elapsed);
  $.par.textContent = fmt(lv.par);
  const frac = Math.max(0, 1 - state.elapsed / lv.par);
  $.parFill.style.width = (frac * 100).toFixed(1) + '%';
  $.parFill.classList.toggle('over', state.elapsed > lv.par);
  $.score.textContent = state.totalScore + state.levelScore;
  $.leftN.textContent = remaining();
  $.hintsN.textContent = state.hintsLeft;
  $.hintBtn.disabled = state.hintsLeft <= 0 || state.screen !== 'play';
  $.muteBtn.textContent = state.muted ? '🔇' : '🔊';
  $.foundList.textContent = state.found.length
    ? 'Found ' + state.found.length + '/' + level().diffs.length + ': ' +
      level().diffs.find((d) => d.id === state.found[state.found.length - 1]).label
    : '';
}

// ------------------------------------------------------------------ render
function drawMarker(px, d, num) {
  const cx = px + d.x, cy = PANEL_Y + d.y;
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#e33';
  ctx.beginPath();
  ctx.arc(cx, cy, d.r + 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy, d.r + 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#e33';
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(num), cx, cy + 0.5);
}

function drawPanelLabel(px, text) {
  ctx.fillStyle = '#9ab0c4';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, px + 4, 17);
}

function render(now) {
  const lv = level();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPanelLabel(PANEL_X[0], '◀  ORIGINAL');
  drawPanelLabel(PANEL_X[1], 'FIND THE DIFFERENCES  ▶');
  for (let p = 0; p < 2; p++) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(PANEL_X[p], PANEL_Y, PW, PH);
    ctx.clip();
    ctx.translate(PANEL_X[p], PANEL_Y);
    lv.paint(ctx, p === 1);
    ctx.restore();
    ctx.strokeStyle = '#33506e';
    ctx.lineWidth = 2;
    ctx.strokeRect(PANEL_X[p], PANEL_Y, PW, PH);
  }
  // Found markers on both panels, numbered in find order.
  state.found.forEach((id, i) => {
    const d = lv.diffs.find((x) => x.id === id);
    if (!d) return;
    drawMarker(PANEL_X[0], d, i + 1);
    drawMarker(PANEL_X[1], d, i + 1);
  });
  // Hint pulse: gold ring around one UNFOUND difference, both panels.
  if (state.hintTarget && now < state.hintUntil) {
    const d = lv.diffs.find((x) => x.id === state.hintTarget);
    if (d && !state.found.includes(d.id)) {
      const pulse = 1 + 0.18 * Math.sin(now / 90);
      for (const px of PANEL_X) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(px + d.x, PANEL_Y + d.y, (d.r + 10) * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      state.hintTarget = null;
    }
  }
  // Miss flashes: red X that fades.
  state.flashes = state.flashes.filter((f) => f.life > 0);
  for (const f of state.flashes) {
    const cx = PANEL_X[f.panel] + f.x, cy = PANEL_Y + f.y;
    ctx.globalAlpha = Math.min(1, f.life * 2);
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 12); ctx.lineTo(cx + 12, cy + 12);
    ctx.moveTo(cx + 12, cy - 12); ctx.lineTo(cx - 12, cy + 12);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Sparkle particles.
  for (const pt of state.particles) {
    ctx.globalAlpha = Math.max(0, pt.life);
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function tick(now) {
  const dt = state.lastTick ? Math.min(0.1, (now - state.lastTick) / 1000) : 0;
  state.lastTick = now;
  if (state.screen === 'play' && !state.paused && !state.frozen) {
    state.elapsed += dt;
    $.timer.textContent = fmt(state.elapsed);
    const frac = Math.max(0, 1 - state.elapsed / level().par);
    $.parFill.style.width = (frac * 100).toFixed(1) + '%';
    $.parFill.classList.toggle('over', state.elapsed > level().par);
  }
  for (const pt of state.particles) {
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += 160 * dt;
    pt.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const f of state.flashes) f.life -= dt;
  render(now);
  requestAnimationFrame(tick);
}

// ------------------------------------------------------------------ wiring
canvas.addEventListener('click', onCanvasClick);
$.hintBtn.addEventListener('click', () => useHint());
$.muteBtn.addEventListener('click', () => {
  state.muted = !state.muted;
  SFX.muted = state.muted;
  updateHUD();
});
$.pauseBtn.addEventListener('click', togglePause);
el('start-btn').addEventListener('click', () => { SFX.blip(); startGame(); });
el('next-btn').addEventListener('click', () => { SFX.blip(); nextLevel(); });
el('replay-btn').addEventListener('click', () => { SFX.blip(); startLevel(state.levelIdx); });
el('again-btn').addEventListener('click', () => { SFX.blip(); startGame(); });
el('resume-btn').addEventListener('click', () => { SFX.blip(); togglePause(); });

function togglePause() {
  if (state.screen === 'play') {
    state.paused = true;
    state.screen = 'pause';
    showOnly('pause');
  } else if (state.screen === 'pause') {
    state.paused = false;
    state.screen = 'play';
    showOnly(null);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && state.screen === 'title') { SFX.blip(); startGame(); return; }
  if (e.key === 'h' || e.key === 'H') { useHint(); return; }
  if (e.key === 'm' || e.key === 'M') {
    state.muted = !state.muted;
    SFX.muted = state.muted;
    updateHUD();
    return;
  }
  if (e.key === 'r' || e.key === 'R') {
    if (state.screen === 'play' || state.screen === 'win') startLevel(state.levelIdx);
    return;
  }
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
});

// ------------------------------------------------------------------ boot
loadMeta();
buildLevelRow();
updateHUD();
showOnly('title');
requestAnimationFrame(tick);

// Expose a small API for the screenshot states (shots.js) and self-test.
window.Game = {
  state, startLevel, startGame, nextLevel, useHint, findAt, updateHUD,
  level, remaining, TOTAL_DIFFS,
  clickAt(panel, x, y) {
    const d = findAt(x, y);
    if (d) {
      state.found.push(d.id);
      state.levelScore += 100;
      state.hintTarget = null;
      if (state.found.length === level().diffs.length) levelComplete();
      updateHUD();
      return { found: d.id };
    }
    state.misses += 1;
    state.levelScore = Math.max(0, state.levelScore - 25);
    updateHUD();
    return { miss: true };
  },
};

if (window.applyShot) window.applyShot(new URLSearchParams(location.search));

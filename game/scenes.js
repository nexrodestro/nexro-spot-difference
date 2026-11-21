// LANTERN HARBOR — scene painters + difference definitions.
// Every scene is drawn twice: left panel = base, right panel = base with
// the differences applied (the `right` flag flips each difference).
// Panel space is 620 x 640. All art is procedural canvas 2D — no images.
//
// Difference model: { id, x, y, r, label } in panel coordinates.
// Click radius r is always >= 22 and every difference is >= ~14 px on
// screen, so nothing is a pixel hunt.

'use strict';

const PANEL_W = 620;
const PANEL_H = 640;

function sky(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function disc(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 8 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 8 * s, x + 12 * s, y);
  ctx.stroke();
}

function cloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 16 * s, 0, Math.PI * 2);
  ctx.arc(x + 18 * s, y - 6 * s, 13 * s, 0, Math.PI * 2);
  ctx.arc(x + 36 * s, y, 15 * s, 0, Math.PI * 2);
  ctx.arc(x + 18 * s, y + 5 * s, 14 * s, 0, Math.PI * 2);
  ctx.fill();
}

function lighthouse(ctx, x, baseY, h, right, windowLit) {
  // Tapered tower with stripes, gallery, lamp room and light beam.
  const wTop = 34, wBot = 52;
  ctx.fillStyle = '#f3ead8';
  ctx.beginPath();
  ctx.moveTo(x - wTop / 2, baseY - h);
  ctx.lineTo(x + wTop / 2, baseY - h);
  ctx.lineTo(x + wBot / 2, baseY);
  ctx.lineTo(x - wBot / 2, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c65b4e';
  ctx.beginPath();
  ctx.moveTo(x - 44 / 2, baseY - h * 0.62);
  ctx.lineTo(x + 44 / 2, baseY - h * 0.62);
  ctx.lineTo(x + 48 / 2, baseY - h * 0.34);
  ctx.lineTo(x - 48 / 2, baseY - h * 0.34);
  ctx.closePath();
  ctx.fill();
  // Gallery + lamp room.
  rect(ctx, x - 26, baseY - h - 16, 52, 16, '#3a2e2a');
  rect(ctx, x - 18, baseY - h - 40, 36, 24, '#ffd98a');
  rect(ctx, x - 22, baseY - h - 46, 44, 7, '#3a2e2a');
  // Lamp glow.
  const glow = ctx.createRadialGradient(x, baseY - h - 28, 4, x, baseY - h - 28, 46);
  glow.addColorStop(0, 'rgba(255, 220, 130, 0.85)');
  glow.addColorStop(1, 'rgba(255, 220, 130, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 46, baseY - h - 74, 92, 92);
  // Tower window: lit amber on the left, dark on the right.
  disc(ctx, x, baseY - h * 0.5, 8, windowLit ? '#ffd98a' : '#2e2a33');
  // Beam (only drawn by the scene that wants it; see painters).
  return { x, topY: baseY - h - 28 };
}

function cottage(ctx, x, y, w, h, body, roof, winLeftLit, winRightLit) {
  rect(ctx, x, y, w, h, body);
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x + w / 2, y - 34);
  ctx.lineTo(x + w + 10, y);
  ctx.closePath();
  ctx.fill();
  rect(ctx, x + w - 26, y - 26, 14, 26, '#6b4a3a'); // chimney
  rect(ctx, x + 14, y + 16, 20, 24, winLeftLit ? '#ffd98a' : '#2e2a33');
  rect(ctx, x + w - 36, y + 16, 20, 24, winRightLit ? '#ffd98a' : '#2e2a33');
  rect(ctx, x + w / 2 - 11, y + h - 34, 22, 34, '#5a3d2b');
}

function boat(ctx, x, y, s, hull, sailColor, sailStripe) {
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(x - 46 * s, y);
  ctx.lineTo(x + 46 * s, y);
  ctx.lineTo(x + 32 * s, y + 16 * s);
  ctx.lineTo(x - 32 * s, y + 16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a2e2a';
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 62 * s);
  ctx.stroke();
  ctx.fillStyle = sailColor;
  ctx.beginPath();
  ctx.moveTo(x + 3 * s, y - 58 * s);
  ctx.lineTo(x + 3 * s, y - 6 * s);
  ctx.lineTo(x + 38 * s, y - 6 * s);
  ctx.closePath();
  ctx.fill();
  // A single coral stripe across the sail (right panel only): the same
  // white sail, one quiet band of color — fair, but not shouting.
  if (sailStripe) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + 3 * s, y - 58 * s);
    ctx.lineTo(x + 3 * s, y - 6 * s);
    ctx.lineTo(x + 38 * s, y - 6 * s);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = sailStripe;
    ctx.fillRect(x, y - 34 * s, 44 * s, 9 * s);
    ctx.restore();
  }
  // Little flag on the mast.
  ctx.fillStyle = '#c65b4e';
  ctx.beginPath();
  ctx.moveTo(x, y - 62 * s);
  ctx.lineTo(x + 16 * s, y - 57 * s);
  ctx.lineTo(x, y - 52 * s);
  ctx.closePath();
  ctx.fill();
}

function cat(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 16 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  disc(ctx, x + 13 * s, y - 8 * s, 8 * s, color);
  ctx.beginPath();
  ctx.moveTo(x + 8 * s, y - 14 * s);
  ctx.lineTo(x + 10 * s, y - 22 * s);
  ctx.lineTo(x + 14 * s, y - 14 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 14 * s, y - 14 * s);
  ctx.lineTo(x + 17 * s, y - 22 * s);
  ctx.lineTo(x + 20 * s, y - 14 * s);
  ctx.closePath();
  ctx.fill();
  // Tail curled up.
  ctx.strokeStyle = color;
  ctx.lineWidth = 4 * s;
  ctx.beginPath();
  ctx.moveTo(x - 15 * s, y - 2 * s);
  ctx.quadraticCurveTo(x - 26 * s, y - 6 * s, x - 22 * s, y - 18 * s);
  ctx.stroke();
}

function buoy(ctx, x, y, stripe) {
  ctx.fillStyle = '#e8b23a';
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 22);
  ctx.lineTo(x + 14, y - 22);
  ctx.lineTo(x + 18, y + 6);
  ctx.lineTo(x - 18, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = stripe;
  ctx.fillRect(x - 16, y - 10, 32, 9);
  ctx.fillStyle = '#8a5a1e';
  ctx.fillRect(x - 3, y - 30, 6, 9);
  // Waterline ripple.
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 26, 5, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// ---------------------------------------------------------------- L1: Harbor at Dusk
const HARBOR_DIFFS = [
  { id: 'gull',    x: 452, y: 92,  r: 26, label: 'A gull vanished from the sky' },
  { id: 'lamp',    x: 118, y: 208, r: 24, label: 'The lighthouse window went dark' },
  { id: 'cat',     x: 486, y: 486, r: 28, label: 'The pier cat wandered off' },
  { id: 'buoy',    x: 316, y: 540, r: 26, label: 'The buoy stripe changed color' },
  { id: 'window',  x: 528, y: 356, r: 24, label: 'A cottage window went dark' },
  { id: 'crate',   x: 96,  y: 500, r: 28, label: 'One crate is missing from the stack' },
  { id: 'sail',    x: 412, y: 366, r: 30, label: 'A stripe appeared on the sail' },
];

function paintHarbor(ctx, right) {
  const W = PANEL_W, H = PANEL_H;
  sky(ctx, W, H, [[0, '#2e3a5c'], [0.45, '#7a5a78'], [0.7, '#e08a5a'], [1, '#f2b879']]);
  disc(ctx, 520, 96, 30, '#ffd9a0'); // low sun
  disc(ctx, 520, 96, 46, 'rgba(255, 217, 160, 0.25)');
  cloud(ctx, 120, 84, 1.1, 'rgba(255, 214, 180, 0.85)');
  cloud(ctx, 330, 56, 0.8, 'rgba(255, 214, 180, 0.7)');
  if (!right) gull(ctx, 452, 92, 1, '#2e2a33'); // difference: gull (left only)
  gull(ctx, 380, 130, 0.8, '#2e2a33');
  gull(ctx, 520, 140, 0.7, '#2e2a33');
  // Sea.
  const sea = ctx.createLinearGradient(0, 300, 0, H);
  sea.addColorStop(0, '#3f6d8e');
  sea.addColorStop(1, '#1d3a52');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, W, H - 300);
  ctx.strokeStyle = 'rgba(255, 220, 160, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(30 + i * 30, 330 + i * 52);
    ctx.quadraticCurveTo(90 + i * 40, 326 + i * 52, 150 + i * 30, 330 + i * 52);
    ctx.stroke();
  }
  // Lighthouse on the rocks, left side.
  rect(ctx, 60, 300, 130, 26, '#4a4a52');
  const lamp = lighthouse(ctx, 118, 300, 190, right, !right);
  // Light beam sweeping right across the dusk sky.
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.moveTo(lamp.x + 10, lamp.topY);
  ctx.lineTo(W, lamp.topY - 70);
  ctx.lineTo(W, lamp.topY + 30);
  ctx.lineTo(lamp.x + 10, lamp.topY + 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Cottages on the right shore. Only the RIGHT window of the big cottage
  // goes dark on the right panel — one small square, not the whole house.
  cottage(ctx, 470, 330, 86, 64, '#8a6a58', '#5a3d2b', true, !right);
  cottage(ctx, 380, 352, 70, 52, '#7a5a68', '#4a2e3a', true, true);
  // Boats.
  boat(ctx, 398, 392, 1, '#5a3d2b', '#f3ead8', right ? '#c65b4e' : null); // difference: sail stripe
  boat(ctx, 250, 470, 0.8, '#3a4a5a', '#f3ead8', null);
  // Pier along the bottom.
  rect(ctx, 0, 520, W, 18, '#6b4a3a');
  rect(ctx, 0, 538, W, 10, '#5a3d2b');
  for (let x = 20; x < W; x += 60) rect(ctx, x, 538, 10, 60, '#4a3527');
  // Buoy bobbing near the pier.
  buoy(ctx, 316, 540, right ? '#2e7d6b' : '#c65b4e'); // difference: stripe
  // Crates stacked on the pier, left end.
  rect(ctx, 70, 486, 34, 34, '#a87c4a');
  rect(ctx, 108, 486, 34, 34, '#96683c');
  if (!right) rect(ctx, 87, 452, 34, 34, '#b08a52'); // difference: top crate
  rect(ctx, 70, 486, 34, 4, '#7a5a30');
  rect(ctx, 108, 486, 34, 4, '#7a5a30');
  // The pier cat, sitting at the far end.
  if (!right) cat(ctx, 486, 486, 1, '#2e2a33'); // difference: cat
  // Distant hills.
  ctx.fillStyle = '#3a3a52';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(200, 240, 420, 300);
  ctx.lineTo(0, 300);
  ctx.fill();
}

// ---------------------------------------------------------------- L2: Night Market
const MARKET_DIFFS = [
  { id: 'lantern', x: 150, y: 128, r: 24, label: 'A lantern changed color' },
  { id: 'flag',    x: 286, y: 104, r: 22, label: 'A bunting flag is missing' },
  { id: 'dog',     x: 486, y: 520, r: 28, label: 'The market dog ran off' },
  { id: 'basket',  x: 184, y: 496, r: 26, label: 'One basket is missing' },
  { id: 'moon',    x: 528, y: 84,  r: 28, label: 'The moon changed shape' },
  { id: 'steam',   x: 262, y: 268, r: 26, label: 'The food cart stopped steaming' },
  { id: 'awning',  x: 470, y: 183, r: 26, label: 'An awning stripe changed color' },
];

function lantern(ctx, x, y, color, lit) {
  ctx.strokeStyle = '#3a2e2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 26);
  ctx.lineTo(x, y - 12);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2e2a';
  ctx.fillRect(x - 6, y - 20, 12, 5);
  ctx.fillRect(x - 6, y + 15, 12, 5);
  if (lit) {
    const glow = ctx.createRadialGradient(x, y, 4, x, y, 34);
    glow.addColorStop(0, 'rgba(255, 190, 90, 0.5)');
    glow.addColorStop(1, 'rgba(255, 190, 90, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 34, y - 34, 68, 68);
  }
}

function stall(ctx, x, y, w, h, awning, right) {
  // Awning with stripes; the right panel swaps one stripe color.
  for (let i = 0; i < 5; i++) {
    const stripe = (i % 2 === 0) ? awning : '#f3ead8';
    ctx.fillStyle = (right && i === 2) ? '#2e7d6b' : stripe;
    ctx.fillRect(x + i * (w / 5), y, w / 5, 26);
  }
  ctx.fillStyle = '#3a2e2a';
  ctx.fillRect(x - 4, y + 26, 4, h);
  ctx.fillRect(x + w, y + 26, 4, h);
  rect(ctx, x, y + 26, w, h - 26, '#6b4a3a');
  rect(ctx, x, y + 26, w, 8, '#8a6a4a');
}

function paintMarket(ctx, right) {
  const W = PANEL_W, H = PANEL_H;
  sky(ctx, W, H, [[0, '#1d2440'], [0.55, '#3a2a52'], [1, '#6b3a52']]);
  // Moon: full on the left, crescent on the right.
  disc(ctx, 528, 84, 26, '#f3ead8');
  if (right) disc(ctx, 540, 78, 24, '#3a2a52'); // difference: moon
  disc(ctx, 528, 84, 40, 'rgba(243, 234, 216, 0.15)');
  for (let i = 0; i < 24; i++) {
    const sx = (i * 97) % W, sy = (i * 53) % 200 + 10;
    disc(ctx, sx, sy, 1.6, 'rgba(255,255,255,0.8)');
  }
  // Bunting across the top.
  ctx.strokeStyle = '#d8c8a8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.quadraticCurveTo(W / 2, 120, W, 60);
  ctx.stroke();
  const flagColors = ['#c65b4e', '#e8b23a', '#2e7d6b', '#7a5a9a'];
  for (let i = 0; i < 9; i++) {
    const fx = 30 + i * 64;
    const fy = 60 + Math.sin((fx / W) * Math.PI) * 34;
    if (right && i === 4) continue; // difference: missing flag
    ctx.fillStyle = flagColors[i % 4];
    ctx.beginPath();
    ctx.moveTo(fx - 12, fy);
    ctx.lineTo(fx + 12, fy);
    ctx.lineTo(fx, fy + 26);
    ctx.closePath();
    ctx.fill();
  }
  // Stalls.
  stall(ctx, 60, 170, 180, 190, '#c65b4e', false);
  stall(ctx, 380, 170, 180, 190, '#2e7d6b', right); // difference: awning stripe
  // Goods on the counters: fruit pyramids and jars.
  for (let i = 0; i < 3; i++) {
    disc(ctx, 100 + i * 40, 330, 12, '#e8b23a');
    disc(ctx, 120 + i * 40, 312, 12, '#c65b4e');
  }
  for (let i = 0; i < 4; i++) rect(ctx, 420 + i * 34, 318, 24, 30, i % 2 ? '#7a5a9a' : '#e8b23a');
  // Food cart with a steaming pot, center.
  rect(ctx, 220, 300, 90, 90, '#4a3527');
  disc(ctx, 265, 296, 26, '#2e2a33');
  disc(ctx, 265, 296, 18, '#8a6a4a');
  if (!right) { // difference: steam
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const [sx, sy] of [[252, 268], [266, 258], [280, 268]]) {
      ctx.beginPath();
      ctx.moveTo(sx, sy + 12);
      ctx.quadraticCurveTo(sx - 6, sy, sx + 2, sy - 10);
      ctx.stroke();
    }
  }
  rect(ctx, 200, 390, 130, 14, '#6b4a3a');
  // Hanging lanterns.
  lantern(ctx, 150, 128, right ? '#2e7d6b' : '#c65b4e', true); // difference: lantern
  lantern(ctx, 470, 120, '#e8b23a', true);
  lantern(ctx, 330, 140, '#c65b4e', true);
  // Cobblestone ground.
  rect(ctx, 0, 430, W, H - 430, '#3a3244');
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let y = 450; y < H; y += 34) for (let x = (y % 68 ? 0 : 22); x < W; x += 44) {
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Baskets of produce, bottom left.
  ctx.fillStyle = '#a87c4a';
  for (const bx of [96, 140]) {
    ctx.beginPath();
    ctx.moveTo(bx - 22, 486);
    ctx.lineTo(bx + 22, 486);
    ctx.lineTo(bx + 16, 516);
    ctx.lineTo(bx - 16, 516);
    ctx.closePath();
    ctx.fill();
  }
  if (!right) { // difference: third basket
    ctx.beginPath();
    ctx.moveTo(184 - 22, 486);
    ctx.lineTo(184 + 22, 486);
    ctx.lineTo(184 + 16, 516);
    ctx.lineTo(184 - 16, 516);
    ctx.closePath();
    ctx.fill();
  }
  disc(ctx, 96, 482, 8, '#c65b4e');
  disc(ctx, 140, 482, 8, '#e8b23a');
  disc(ctx, 118, 474, 8, '#2e7d6b');
  // The market dog, asleep by the stall.
  if (!right) { // difference: dog
    ctx.fillStyle = '#8a6a4a';
    ctx.beginPath();
    ctx.ellipse(486, 520, 26, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    disc(ctx, 510, 512, 10, '#8a6a4a');
    ctx.beginPath();
    ctx.moveTo(516, 504);
    ctx.lineTo(520, 496);
    ctx.lineTo(524, 504);
    ctx.closePath();
    ctx.fill();
  }
  // String lights along the stalls.
  ctx.strokeStyle = '#d8c8a8';
  ctx.beginPath();
  ctx.moveTo(60, 168);
  ctx.quadraticCurveTo(310, 150, 560, 168);
  ctx.stroke();
  for (let i = 0; i < 10; i++) {
    const lx = 70 + i * 52;
    disc(ctx, lx, 164 + Math.sin(i) * 3, 4, '#ffd98a');
  }
}

// ---------------------------------------------------------------- L3: Lighthouse Dawn
const DAWN_DIFFS = [
  { id: 'beam',    x: 400, y: 100, r: 30, label: 'The lighthouse beam swung the other way' },
  { id: 'gull',    x: 452, y: 92,  r: 24, label: 'A gull left the dawn sky' },
  { id: 'rock',    x: 150, y: 500, r: 26, label: 'A rock slipped under the tide' },
  { id: 'star',    x: 322, y: 520, r: 22, label: 'A starfish hid in the tide pool' },
  { id: 'net',     x: 486, y: 452, r: 26, label: 'The fishing net changed color' },
  { id: 'sun',     x: 500, y: 113, r: 28, label: 'The sun rose higher' },
  { id: 'window',  x: 118, y: 230, r: 22, label: 'The lighthouse window went dark' },
  { id: 'flag',    x: 128, y: 72,  r: 22, label: 'The lighthouse flag changed color' },
];

function starfish(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * 14 * s, y + Math.sin(a) * 14 * s);
    ctx.lineTo(x + Math.cos(a2) * 6 * s, y + Math.sin(a2) * 6 * s);
  }
  ctx.closePath();
  ctx.fill();
}

function paintDawn(ctx, right) {
  const W = PANEL_W, H = PANEL_H;
  sky(ctx, W, H, [[0, '#8fb8d8'], [0.45, '#f2c98a'], [0.75, '#e89a6a'], [1, '#d87a5a']]);
  // Sun: low on the left, higher on the right.
  const sunY = right ? 96 : 130;
  disc(ctx, 500, sunY, 34, '#fff0c0');
  disc(ctx, 500, sunY, 52, 'rgba(255, 240, 192, 0.3)');
  cloud(ctx, 140, 90, 1, 'rgba(255, 240, 220, 0.9)');
  cloud(ctx, 360, 60, 0.7, 'rgba(255, 240, 220, 0.7)');
  if (!right) gull(ctx, 452, 92, 1, '#2e2a33'); // difference: gull (left only)
  gull(ctx, 380, 128, 0.8, '#2e2a33');
  gull(ctx, 540, 150, 0.7, '#2e2a33');
  // Sea with sun glitter.
  const sea = ctx.createLinearGradient(0, 330, 0, H);
  sea.addColorStop(0, '#5a8aa8');
  sea.addColorStop(1, '#2a4a68');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 330, W, H - 330);
  ctx.fillStyle = 'rgba(255, 240, 192, 0.5)';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(470 + (i % 3) * 14 - 20, 340 + i * 22, 44 - (i % 3) * 10, 3);
  }
  // Lighthouse on the rocks.
  rect(ctx, 60, 330, 130, 26, '#5a5a62');
  const lamp = lighthouse(ctx, 118, 330, 200, right, !right);
  // Flag on top: red left, amber right.
  ctx.fillStyle = right ? '#e8b23a' : '#c65b4e';
  ctx.beginPath();
  ctx.moveTo(118, lamp.topY - 34);
  ctx.lineTo(142, lamp.topY - 28);
  ctx.lineTo(118, lamp.topY - 22);
  ctx.closePath();
  ctx.fill();
  // Beam: sweeps left on the left panel, right on the right panel.
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#fff0c0';
  ctx.beginPath();
  if (right) {
    ctx.moveTo(lamp.x + 10, lamp.topY);
    ctx.lineTo(W, lamp.topY - 60);
    ctx.lineTo(W, lamp.topY + 40);
  } else {
    ctx.moveTo(lamp.x - 10, lamp.topY);
    ctx.lineTo(0, lamp.topY - 60);
    ctx.lineTo(0, lamp.topY + 40);
  }
  ctx.lineTo(lamp.x, lamp.topY + 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Rocky shore and tide pools, bottom.
  ctx.fillStyle = '#4a4a52';
  ctx.beginPath();
  ctx.moveTo(0, 640);
  ctx.lineTo(0, 540);
  ctx.quadraticCurveTo(160, 500, 300, 540);
  ctx.quadraticCurveTo(460, 580, 620, 520);
  ctx.lineTo(620, 640);
  ctx.closePath();
  ctx.fill();
  // Tide pool with a starfish.
  ctx.fillStyle = '#3f6d8e';
  ctx.beginPath();
  ctx.ellipse(322, 520, 52, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!right) starfish(ctx, 322, 520, 1, '#e87a5a'); // difference: starfish
  // A rock that slips under the tide on the right.
  if (!right) {
    ctx.fillStyle = '#3a3a44';
    ctx.beginPath();
    ctx.ellipse(150, 500, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Fishing net draped over a post.
  ctx.strokeStyle = right ? '#e87a3a' : '#7a9ab8'; // difference: net color
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(452 + i * 16, 420);
    ctx.lineTo(452 + i * 16, 486);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(448, 428 + i * 12);
    ctx.lineTo(524, 428 + i * 12);
    ctx.stroke();
  }
  rect(ctx, 448, 410, 8, 80, '#5a3d2b');
  rect(ctx, 520, 410, 8, 80, '#5a3d2b');
}

// ---------------------------------------------------------------- Level table
const LEVELS = [
  { name: 'Harbor at Dusk',  par: 180, diffs: HARBOR_DIFFS, paint: paintHarbor },
  { name: 'Night Market',    par: 150, diffs: MARKET_DIFFS, paint: paintMarket },
  { name: 'Lighthouse Dawn', par: 120, diffs: DAWN_DIFFS,   paint: paintDawn },
];

window.LanternHarbor = { PANEL_W, PANEL_H, LEVELS };

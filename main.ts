// LANTERN HARBOR — make.fun entrypoint (Node 22, standard library only).
//
// The game is plain static files under game/ (index.html + plain scripts,
// no library, no network request). This program hands the entry in: it
// copies game/ and screenshots/ from beside this file into /output and
// writes /output/dossier.json, the summary the judge reads, using the
// vendored make.fun library. The scorer's caps are the same ones the
// kit's reference gate uses; anything over them is refused here first.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output — try it with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(name) {
  const src = join(here, name);
  const dst = join(out, name);
  if (!existsSync(src)) return;
  mkdirSync(dst, { recursive: true });
  cpSync(src, dst, { recursive: true });
}

mkdirSync(out, { recursive: true });
copyTree('game');
copyTree('screenshots');

// The gate's caps (kit reference/gate.json): text_max_bytes is the only
// one that shapes the dossier's bytes. The rest refuse an entry the
// scorer would refuse — more than 4 screenshots or one over 256 KiB,
// more than 993 files or 48 MiB under game/, or any game/ path over
// 1000 bytes. /output itself caps at 1000 entries and 64 MiB in all.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

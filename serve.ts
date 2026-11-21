// LANTERN HARBOR — local play server (dev tool, not part of game/).
// Serves game/ on localhost:8080 so the game can be played in desktop
// Chrome exactly as the finalist review will serve it: plain static
// files, no build step, no network.
//
// Usage: node serve.ts   (Node 22+, standard library only)

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
};

const server = createServer(async (req, res) => {
  const raw = decodeURIComponent(req.url.split('?')[0]);
  const path = raw === '/' || raw === '' ? '/index.html' : raw;
  try {
    const data = await readFile(join(root, path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(8080, () => console.log('LANTERN HARBOR at http://localhost:8080'));

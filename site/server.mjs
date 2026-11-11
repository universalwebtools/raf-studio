// Lokalny serwer: strona (dist/) + edytor (/admin/) + zapis treści.
// Użycie: node server.mjs   →   http://localhost:4321  i  http://localhost:4321/admin/
import { createServer } from 'node:http';
import { readFile, writeFile, stat, mkdir, rename } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { build, CONTENT, CONTENT_FILES, DIST } from './build.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4321;
const run = promisify(execFile);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};

// Bezpieczne łączenie ścieżek: nie pozwala wyjść poza katalog bazowy.
function safeJoin(base, p) {
  const full = normalize(join(base, decodeURIComponent(p)));
  return full.startsWith(base) ? full : null;
}

async function sendFile(req, res, file) {
  try {
    let s = await stat(file);
    if (s.isDirectory()) { file = join(file, 'index.html'); s = await stat(file); }
    const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
    // Obsługa zakresów – potrzebna do przewijania wideo.
    const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
    if (range && type.startsWith('video')) {
      const start = Number(range[1] || 0), end = range[2] ? Number(range[2]) : s.size - 1;
      const { createReadStream } = await import('node:fs');
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${s.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      return createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await readFile(join(DIST, '404.html')).catch(() => 'Nie znaleziono'));
  }
}

const readBody = (req, limit = 60e6) => new Promise((ok, fail) => {
  const chunks = []; let size = 0;
  req.on('data', (c) => { size += c.length; if (size > limit) { fail(new Error('Plik jest za duży')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => ok(Buffer.concat(chunks)));
  req.on('error', fail);
});

const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'plik';

async function handleSave(req, res) {
  const body = JSON.parse((await readBody(req, 5e6)).toString('utf8'));
  for (const name of CONTENT_FILES) {
    if (!(name in body)) continue;
    const file = join(CONTENT, `${name}.json`);
    const tmp = file + '.tmp';
    await writeFile(tmp, JSON.stringify(body[name], null, 2) + '\n');
    await rename(tmp, file);
  }
  const pages = await build();
  json(res, 200, { ok: true, pages: pages.length, savedAt: new Date().toISOString() });
}

// Wgrywanie zdjęć: zapis do media/ i konwersja do WebP (ImageMagick, jeśli jest).
async function handleUpload(req, res, query) {
  const name = slugify((query.get('name') || 'zdjecie').replace(/\.[^.]+$/, ''));
  const buf = await readBody(req);
  await mkdir(join(ROOT, 'media'), { recursive: true });
  const stamp = Date.now().toString(36);
  const srcExt = (extname(query.get('name') || '').toLowerCase() || '.jpg');
  const raw = join(ROOT, 'media', `${name}-${stamp}${srcExt}`);
  await writeFile(raw, buf);
  let out = raw;
  try {
    const webp = join(ROOT, 'media', `${name}-${stamp}.webp`);
    await run('magick', [raw, '-auto-orient', '-resize', '2000x2000>', '-strip', '-quality', '80', webp]);
    if (webp !== raw) { const { unlink } = await import('node:fs/promises'); await unlink(raw); }
    out = webp;
  } catch { /* brak ImageMagick – zostaje oryginał */ }
  const rel = 'media/' + out.split(/[\\/]/).pop();
  // Kopia do dist, żeby podgląd od razu widział nowe zdjęcie.
  await mkdir(join(DIST, 'media'), { recursive: true });
  await writeFile(join(DIST, rel), await readFile(out));
  json(res, 200, { ok: true, src: rel });
}

createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;
  try {
    if (req.method === 'POST' && p === '/api/save') return await handleSave(req, res);
    if (req.method === 'POST' && p === '/api/upload') return await handleUpload(req, res, u.searchParams);
    if (p === '/admin') { res.writeHead(301, { Location: '/admin/' }); return res.end(); }
    if (p.startsWith('/admin/')) return sendFile(req, res, safeJoin(join(ROOT, 'admin'), p.slice(7) || 'index.html'));
    if (p.startsWith('/src/')) return sendFile(req, res, safeJoin(join(ROOT, 'src'), p.slice(5)));
    if (p.startsWith('/content/')) return sendFile(req, res, safeJoin(CONTENT, p.slice(9)));
    const f = safeJoin(DIST, p.slice(1));
    return f ? sendFile(req, res, f) : json(res, 400, { error: 'Zła ścieżka' });
  } catch (e) {
    console.error(e);
    json(res, 500, { ok: false, error: e.message });
  }
}).listen(PORT, '127.0.0.1', async () => {
  await build();
  console.log(`Strona:  http://localhost:${PORT}/`);
  console.log(`Edytor:  http://localhost:${PORT}/admin/`);
});

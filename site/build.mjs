// Generuje gotową stronę (czysty HTML) z plików w content/ do katalogu docs/ w repozytorium,
// skąd serwuje ją GitHub Pages.
// Użycie:  node build.mjs                      → raf-studio.pl
//          BASE=/raf-studio-podglad NOINDEX=1 node build.mjs   → strona testowa
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
export const CONTENT = join(ROOT, 'content');
export const DIST = process.env.OUT ? join(ROOT, process.env.OUT) : join(ROOT, '..', 'docs');
export const CONTENT_FILES = ['site', 'home', 'services', 'portfolio', 'blog'];
const BASE = (process.env.BASE || '').replace(/\/$/, '');
const NOINDEX = !!process.env.NOINDEX;

export async function loadContent() {
  const data = {};
  for (const name of CONTENT_FILES) data[name] = JSON.parse(await readFile(join(CONTENT, `${name}.json`), 'utf8'));
  return data;
}

async function write(file, text) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, text);
}

export async function build() {
  const t0 = Date.now();
  // Świeży import szablonów przy każdym buildzie (podczas pracy z edytorem).
  const { renderSite } = await import(pathToFileURL(join(ROOT, 'src/templates.mjs')).href + `?t=${t0}`);
  const data = await loadContent();

  await rm(DIST, { recursive: true, force: true });
  const files = renderSite(data, { base: BASE, noindex: NOINDEX });
  for (const [path, text] of Object.entries(files)) await write(join(DIST, path), text);

  if (!BASE) await write(join(DIST, 'CNAME'), new URL(data.site.url).host + '\n');
  await write(join(DIST, '.nojekyll'), '');
  // Ustawienia dla edytora online: adres bazowy i repozytorium, do którego publikuje.
  const [owner, name] = (process.env.REPO || 'universalwebtools/raf-studio').split('/');
  const repo = { owner, name, branch: process.env.BRANCH || 'main' };
  await write(join(DIST, 'site-config.json'), JSON.stringify({ base: BASE, noindex: NOINDEX, repo }) + '\n');

  await cp(join(ROOT, 'src/style.css'), join(DIST, 'style.css'));
  await cp(join(ROOT, 'src/site.js'), join(DIST, 'site.js'));
  await cp(join(ROOT, 'src/templates.mjs'), join(DIST, 'src/templates.mjs'));
  await cp(join(ROOT, 'admin'), join(DIST, 'admin'), { recursive: true });
  await cp(join(ROOT, 'media'), join(DIST, 'media'), { recursive: true });
  if (existsSync(join(ROOT, 'static'))) await cp(join(ROOT, 'static'), DIST, { recursive: true });

  const pages = Object.keys(files).filter((f) => f.endsWith('index.html'));
  console.log(`Zbudowano ${pages.length} podstron w ${Date.now() - t0} ms → ${DIST}${BASE ? ` (adres: ${BASE}/)` : ''}`);
  return pages;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch((e) => { console.error(e); process.exit(1); });
}

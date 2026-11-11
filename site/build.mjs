// Generuje gotową stronę (czysty HTML) z plików w content/ do dist/.
// Użycie: node build.mjs
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
export const CONTENT = join(ROOT, 'content');
export const DIST = join(ROOT, 'dist');
export const CONTENT_FILES = ['site', 'home', 'services', 'portfolio', 'blog'];

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
  const { routes, notFound } = await import(pathToFileURL(join(ROOT, 'src/templates.mjs')).href + `?t=${t0}`);
  const data = await loadContent();

  await rm(DIST, { recursive: true, force: true });
  const pages = routes(data);
  for (const r of pages) await write(join(DIST, r.path, 'index.html'), r.render());
  await write(join(DIST, '404.html'), notFound(data));

  const base = data.site.url.replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);
  await write(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((r) => `  <url><loc>${base}/${r.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
  <url><loc>${base}/polityka-prywatnosci/</loc></url>
</urlset>
`);
  await write(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
  await write(join(DIST, 'CNAME'), new URL(base).host + '\n');
  await write(join(DIST, '.nojekyll'), '');

  await cp(join(ROOT, 'src/style.css'), join(DIST, 'style.css'));
  await cp(join(ROOT, 'src/site.js'), join(DIST, 'site.js'));
  await cp(join(ROOT, 'media'), join(DIST, 'media'), { recursive: true });
  if (existsSync(join(ROOT, 'static'))) await cp(join(ROOT, 'static'), DIST, { recursive: true });

  console.log(`Zbudowano ${pages.length} podstron w ${Date.now() - t0} ms`);
  return pages.map((r) => r.path);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch((e) => { console.error(e); process.exit(1); });
}

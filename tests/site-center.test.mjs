import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=x=>readFile(new URL('../'+x,import.meta.url),'utf8');
const [entry,center,smart,core,history,opt,index,photo,film,backup,uptime]=await Promise.all([
 'editor-entry.js','editor-site-center-v893.js','site-smart-runtime-v893.js','editor-core-v760.js','editor-version-history-v760.js','image-webp-v60.js','index.html','fotografia.html','film.html','.github/workflows/daily-backup.yml','.github/workflows/uptime.yml'
].map(read));
assert.match(entry,/editor-site-center-v893\.js\?v=893-center-2/);
for(const page of [index,photo,film]){
 assert.match(page,/site-smart-runtime-v893\.js\?v=893-center-2/);
 assert.match(page,/editor-entry\.js\?v=893-center-2/);
}
for(const feature of ['Wersja testowa','Backupy','Kosz 30 dni','Media','Kondycja','Sekcje','SEO','Statystyki'])assert.ok(center.includes(feature),feature);
assert.match(center,/rafStage/);
assert.match(center,/versionHistoryV76/);
assert.match(center,/sectionClipboard/);
assert.match(center,/rafCreateResponsiveImageSet/);
assert.match(center,/runHealth/);
assert.match(center,/analytics\/daily/);
assert.match(center,/odczyt niedostępny/);
assert.match(core,/deletedAt=Date\.now\(\)/);
assert.match(core,/purged:false/);
assert.match(history,/LIMIT=50/);
assert.match(history,/daily:'DZIENNA'/);
assert.match(opt,/RESPONSIVE=\[800,1600,2400\]/);
assert.match(opt,/image\/avif/);
assert.match(smart,/ProfessionalService/);
assert.match(smart,/runTransaction/);
assert.match(smart,/srcset/);
assert.match(backup,/schedule:/);
assert.match(backup,/retention-days: 30/);
assert.match(uptime,/\*\/30 \* \* \* \*/);
assert.match(uptime,/issues: write/);
console.log('PASS: Centrum strony, stage, backups, trash, media optimization, health, sections, SEO, analytics and uptime monitoring are wired');

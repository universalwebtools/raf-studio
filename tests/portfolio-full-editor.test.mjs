import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
const [entry,bridge,publish,workspace,app,photo,film,photoRoute,filmRoute,siteHeader]=await Promise.all([
 read('editor-entry.js'),read('portfolio-full-editor-v893.js'),read('direct-publish-v760.js'),read('editor-workspace-v760.js'),read('app.js'),read('fotografia.html'),read('film.html'),read('fotografia/index.html'),read('film/index.html'),read('site-header-v900.js')
]);

assert.match(entry,/if\(portfolio\)await import\('\.\/portfolio-full-editor-v893\.js\?v=893-full-subpage-3'\)/);
assert.doesNotMatch(entry,/if\(portfolio\).*portfolio-editor\.js/);
for(const module of ['direct-editor-v3.js','editor-core-v760.js','editor-workspace-v760.js','direct-publish-v760.js'])assert.ok(entry.includes(module),`complete stack includes ${module}`);
assert.match(entry,/editor-workspace-v760\.js\?v=893-hero-media-crop-3/);
assert.match(workspace,/window\.addEventListener\('wheel'/);
assert.match(workspace,/stopImmediatePropagation/);
assert.match(workspace,/\{passive:false,capture:true\}/);
assert.match(workspace,/overscroll-behavior:contain/);
assert.match(workspace,/inspectorScrollPositions=new Map/);
assert.match(workspace,/inspectorScrollPositions\.get\(id\)\?\?p\.scrollTop/);
for(const page of [photo,film])assert.ok(page.includes('editor-entry.js?v=893-live-fixes-6'));
for(const route of [photoRoute,filmRoute])assert.ok(route.includes('rafSubpage=893-live-fixes-6'));

assert.ok(app.includes('portfolio:${type}:${item.id}'),'public cards receive stable IDs');
for(const suffix of [':image',':category',':title'])assert.ok(app.includes('${stable}'+suffix)||bridge.includes('${esc(base)}'+suffix),`stable portfolio identifier ${suffix}`);
assert.match(app,/if\(EDITOR_MODE\)return;renderGrid/,'app does not replace editor cards on resize');
assert.match(app,/DEMO_VIDEO/,'public film page rejects template demo video');
assert.match(app,/heroFilm\(remote\)/,'a real published HERO film can replace the rejected demo');
assert.match(app,/x\.visible!==false&&usableImage\(x\.image\)/,'empty photography tiles are not published');
assert.match(app,/photoFallback\(item\)/,'broken known photography tiles receive a local fallback');
assert.match(siteHeader,/SUBPAGE_PUBLIC/,'public photography and film pages force a usable header');
assert.match(siteHeader,/logoUrl:'\/assets\/raf-logo-black\.png'/);
assert.match(bridge,/id="portfolioAdd893"|add\.id='portfolioAdd893'/);
assert.match(bridge,/id="portfolioTile893"|box\.id='portfolioTile893'/);
assert.match(bridge,/window\.rafCore760\?\.refresh/);
assert.match(bridge,/public\/editorPortfolioDraft\/\$\{key\}/);
assert.match(bridge,/public\/\$\{key\}/);
assert.match(bridge,/if\(e\.target\.closest\?\.\('#pub3'\)\)publishItems\(\)/);
assert.match(bridge,/id="portfolioReplaceImage893"/);
assert.match(bridge,/id="portfolioEditImage893"/);
assert.match(bridge,/uploadBytesResumable/);
assert.match(bridge,/window\.rafCore760\?\.selectElement/);
assert.match(publish,/const portfolioPage=.*fotografia\|film/);
assert.match(publish,/if\(!portfolioPage\)\{const title=/);
assert.match(publish,/videoReviewForPage\(stable\.pro/);
assert.match(publish,/videoReviewForPage\(pro,true\)/);

console.log('PASS: photography and film use the complete editor stack, stable public IDs, portfolio fields and joint publishing');

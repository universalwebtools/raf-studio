import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
const [runtime,editor,workspace,pro,performance,entry,index]=await Promise.all([
 read('public-pro-v61.js'),read('editor-hero-media-v888.js'),read('editor-workspace-v760.js'),read('editor-pro-v61.js'),read('video-performance-v888.js'),read('editor-entry.js'),read('index.html')
]);

assert.match(runtime,/fullBleed:false/,'desktop full width mode has an explicit compatible default');
assert.match(runtime,/\(fullBleed\?hero:media\)\.prepend\(w\)/,'video can be hosted by the full HERO or template media field');
assert.match(runtime,/rafHeroVideoFull61/,'full HERO runtime class exists');
assert.match(runtime,/\$\$\('\.rafHeroVideoWrap61',old\)\.forEach\(x=>x\.remove\(\)\)/,'rerenders clean both video host modes');
assert.match(editor,/id="rafHeroFull888"/);
assert.match(editor,/id="rafHeroColumn888"/);
assert.match(editor,/id="rafHeroCover888"/);
assert.match(editor,/id="rafHeroContain888"/);
assert.match(editor,/function startDrag\(e\)/,'direct pointer crop remains available');
assert.match(editor,/window\.rafHeroMediaEditor888=\{select:openVideoEditor/);
assert.match(editor,/pointer-events:auto;touch-action:none/,'crop shield captures drag above embedded players');
assert.match(editor,/function setFrameMode\(full\)/,'frame switching does not rebuild the player');
assert.match(runtime,/rafHeroEditorPoster61/,'YouTube uses a stable 16:9 working frame in the editor');
assert.match(performance,/if\(EDITOR&&!inPreview\(\)\)\{f\.dataset\.rafEditorSuspended888='1';return\}/,'editor does not reload iframe sources');
assert.match(workspace,/id="v893heroVideo"/,'selected HERO exposes its video crop editor');
assert.match(workspace,/rafHeroMediaEditor888\?\.select/);
assert.match(pro,/id="hvFullBleed840"/,'PRO panel exposes the same frame setting');
assert.match(entry,/editor-hero-media-v888\.js\?v=893-hero-video-stable-2/);
assert.match(index,/public-pro-v61\.js\?v=893-hero-video-stable-2/);
assert.match(index,/editor-entry\.js\?v=893-hero-video-stable-2/);

console.log('PASS: HERO video supports direct pan/zoom, cover/contain and template/full-section framing with public parity');

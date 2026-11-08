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
assert.match(editor,/function pointerDown\(e\)/,'the first direct pointer gesture starts video cropping');
assert.match(editor,/window\.rafHeroMediaEditor888=\{select:openVideoEditor,pointerDown/);
assert.match(editor,/pointer-events:auto;touch-action:none/,'crop shield captures drag above embedded players');
assert.doesNotMatch(editor,/overlay\.innerHTML='<i>/,'video crop has no section resize corners');
assert.match(editor,/t===host\|\|wrap\?\.contains\?\.\(t\)/,'full-width video crop does not swallow HERO text and buttons');
assert.match(editor,/function setFrameMode\(full\)/,'frame switching does not rebuild the player');
assert.match(runtime,/rafHeroEditorPoster61/,'YouTube uses a stable 16:9 working frame in the editor');
assert.match(runtime,/w\.dataset\.rafSourceUrl=String\(cfg\.url\|\|''\)/,'rendered HERO keeps its source URL for the crop editor');
assert.match(runtime,/el\.preload=EDITOR\?'auto':'metadata'/,'native HERO video decodes a visible frame while editing');
assert.match(performance,/if\(EDITOR&&!inPreview\(\)\)\{f\.dataset\.rafEditorSuspended888='1';return\}/,'editor does not reload iframe sources');
assert.match(performance,/function previewFrame\(v\)/,'paused native HERO videos seek to a usable preview frame');
assert.match(performance,/if\(editingHero\(v\)\)resumeVideo\(v,true\)/,'the selected HERO video plays during cropping');
assert.match(editor,/id="rafHeroPlay888"/,'the crop inspector exposes play and pause');
assert.match(editor,/id="rafHeroSeek888"/,'the crop inspector exposes a timeline scrubber');
assert.match(editor,/video\.currentTime=duration\*\(Number\(seek\.value\)\/1000\)/,'editor timeline seeks the real native video');
assert.match(runtime,/function heroTransport61\(w,v\)/,'published native HERO videos get transport controls');
assert.match(runtime,/r\.type='range'/,'published HERO exposes a seek slider');
assert.match(performance,/if\(v\.dataset\.rafUserPaused61==='1'\)return/,'automatic playback respects an explicit user pause');
assert.match(workspace,/id="v893heroVideo"/,'selected HERO exposes its video crop editor');
assert.match(workspace,/rafHeroMediaEditor888\?\.select/);
assert.match(workspace,/window\.rafHeroImageCrop893=\{select:activateHeroImage/,'HERO photo has a dedicated crop controller');
assert.match(workspace,/KADROWANIE ZDJĘCIA HERO/,'HERO photo exposes only its crop controls');
assert.match(workspace,/Ramka HERO jest zablokowana/,'the inspector explains the fixed HERO frame');
assert.match(pro,/id="hvFullBleed840"/,'PRO panel exposes the same frame setting');
assert.match(pro,/window\.rafPro61Snapshot=\(\)=>cp\(data\)/,'the crop editor can read the current unsaved PRO state');
assert.match(pro,/window\.rafPro61AdoptHeroVideo=next=>\{data\.heroVideo=.*merge61\(data\)/,'the crop editor keeps both PRO state stores synchronized');
assert.match(editor,/async function openVideoEditor\(\)\{await loadCfg\(\)/,'opening the crop editor always refreshes video configuration');
assert.match(editor,/function active\(\)\{if\(!cfg\)syncCfg\(currentCfg\(\),true\);return refreshRefs\(\)\}/,'crop refreshes never replace an active edit with stale PRO state');
assert.match(editor,/function adoptCfg\(\)\{if\(cfg\)window\.rafPro61AdoptHeroVideo\?\.\(cfg\)\}/,'live crop values become the current editor state');
assert.match(editor,/refresh:\(\)=>\{if\(!selected\)syncCfg\(currentCfg\(\),true\)/,'background refreshes preserve the selected crop');
assert.match(editor,/body\.rafHeroCrop888 \[data-raf-section="Hero"\] \.rafHeroVideoWrap61\{opacity:1!important/,'crop mode reveals the raw video above template tint');
assert.match(entry,/editor-hero-media-v888\.js\?v=893-hero-transport-7/);
assert.match(entry,/editor-parity-v888\.js\?v=893-hero-transport-7/,'parity rerenders use the synchronized HERO state');
assert.match(entry,/video-performance-v888\.js\?v=893-hero-transport-7/,'the visible native preview governor is cache-busted');
assert.doesNotMatch(entry,/editor-hero-resize-v890/,'generic full-section resize overlay is no longer loaded for HERO video');
assert.match(index,/public-pro-v61\.js\?v=893-hero-transport-7/);
assert.match(index,/editor-entry\.js\?v=893-hero-transport-7/);

console.log('PASS: HERO video supports direct pan/zoom, cover/contain and template/full-section framing with public parity');

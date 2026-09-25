import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');

test('Core 9 is the only current canvas mechanics owner',async()=>{
 const entry=read('editor-entry.js');
 for(const forbidden of ['direct-editor-v3.js','editor-history-v72.js','editor-meaningful-undo-v874.js','editor-safe-controls-v876.js','editor-parity-v888.js']){
  expect(entry).not.toContain(forbidden);
 }
 expect(entry).toContain("editor-core-v900.js");
 expect(entry).toContain("editor-history-v900.js");
 expect(entry).toContain("renderer-v900.js");
});

test('one central version manifest drives current editor',async()=>{
 const manifest=read('editor-version.js'),mobile=read('mobile-editor.html'),entry=read('editor-entry.js'),index=read('index.html');
 expect(manifest).toContain("latest='9.0.0'");
 expect(manifest).toContain("build='9000'");
 expect(entry).toContain('RAF_EDITOR_VERSION');
 expect(mobile).toContain('RAF_EDITOR_VERSION');
 expect(index).toContain('/editor-version.js');
});

test('Core 9 is event driven and uses shared layout engine',async()=>{
 const core=read('editor-core-v900.js'),groups=read('editor-groups-v880.js'),dock=read('editor-dock-v889.js');
 expect(core).toContain('editor-layout-engine-v900.js');
 expect(core).toContain('editor-object-id-v900.js');
 expect(core).not.toContain('setInterval(');
 expect(groups).not.toContain('setInterval(');
 expect(dock).not.toContain('setInterval(');
});

test('global history includes builder layout instead of splitting histories',async()=>{
 const hist=read('editor-history-v900.js');
 expect(hist).toContain("main:'website/public/editorDraft'");
 expect(hist).not.toContain('CORE_BUILDER_KEYS');
 expect(hist).toContain('rafHistory900');
 expect(hist).toContain('rafUndo72');
});


test('critical RAF 9 modules pass JavaScript syntax check',async()=>{
 const files=['editor-version.js','editor-entry.js','editor-shell-v900.js','editor-object-id-v900.js','editor-layout-engine-v900.js','renderer-v900.js','editor-history-v900.js','editor-core-v900.js','editor-chrome-v888.js','site-header-v900.js','editor-dock-v889.js','editor-dock-popout-v889.js'];
 for(const file of files)execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
});

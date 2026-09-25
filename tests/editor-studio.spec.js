import {test,expect} from '@playwright/test';
import {mockFirebase,seed} from './helpers/firebase.js';
async function start(page){await mockFirebase(page,seed());await page.goto('/tests/fixtures/canvas.html?editor=direct&suite=1&device=desktop');await page.waitForFunction(()=>window.rafStudio910);await page.waitForTimeout(1000)}
async function choose(page,selector){await page.locator(selector).evaluate(el=>window.rafCore900.selectExact(el));await expect(page.locator('#studioInspector910')).toContainText('Pozycja i rozmiar')}
async function publishFixture(page){await page.evaluate(async()=>{await window.rafCore900.flush();const s=window.__testDB.read('website/public/editorDraft');await window.__testDB.update('website/public',s)});await page.goto('/tests/fixtures/canvas.html');await page.waitForFunction(()=>window.rafRenderer900)}

test('workspace panels collapse, tree selects exact elements, fields edit and reset',async({page})=>{
 await start(page);await expect(page.locator('#studioLeft910')).toBeVisible();await page.locator('#studioLeftToggle910').click();await expect(page.locator('#studioLeft910')).toBeHidden();await page.locator('#studioLeftToggle910').click();
 await choose(page,'#sample');await page.locator('[data-prop=fontSize]').fill('31');await page.locator('[data-prop=fontSize]').press('Tab');await expect(page.locator('#sample')).toHaveCSS('font-size','31px');
 await page.locator('[data-reset=fontSize]').click();await expect(page.locator('#sample')).toHaveCSS('font-size','24px');
});
test('stack container persists, undo restores parent and redo restores container',async({page})=>{
 await start(page);await page.evaluate(()=>{const c=window.rafCore900;c.selectElement(document.querySelector('[data-test=one]'));c.selectElement(document.querySelector('[data-test=two]'),true)});
 await page.locator('[data-action=container]').click();await expect(page.locator('[data-raf-container]')).toHaveCount(1);await expect(page.locator('[data-raf-container]')).toHaveCSS('display','flex');
 await page.keyboard.press('Control+z');await expect(page.locator('[data-raf-container]')).toHaveCount(0);await expect(page.locator('.row>p')).toHaveCount(2);
 await page.keyboard.press('Control+y');await expect(page.locator('[data-raf-container]')).toHaveCount(1);await publishFixture(page);await expect(page.locator('[data-raf-container]')).toHaveCSS('display','flex');
});
test('mobile frame uses a real viewport and inherits tablet styles',async({page})=>{
 await start(page);await page.evaluate(async()=>{const id=window.rafCore900.id(document.querySelector('#sample'));await window.__testDB.update('website/public/editorDraft/builder/freeLayoutV7/tablet',{[id]:{fontSize:29}})});
 await page.locator('[data-device=mobile]').click();const child=page.frameLocator('#studioFrame910');await expect(child.locator('#sample')).toHaveCSS('font-size','29px');
 await child.locator('#sample').click();await expect(page.locator('#studioInspector910')).toContainText('TELEFON');await page.locator('[data-prop=fontSize]').fill('21');await page.locator('[data-prop=fontSize]').press('Tab');await expect(child.locator('#sample')).toHaveCSS('font-size','21px');await page.locator('[data-reset=fontSize]').click();await expect(child.locator('#sample')).toHaveCSS('font-size','29px');
});
test('media upload, folder and replacement preserve geometry',async({page})=>{
 await start(page);await page.evaluate(()=>{const img=document.createElement('img');img.dataset.rafFree='1';img.id='testImage';img.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="60"/%3E';document.querySelector('#rafMain section').append(img);window.rafCore900.refresh();window.rafCore900.selectExact(img);window.rafCore900.patchOne(img,{width:120,height:90})});
 await page.locator('[data-action=pick-media]').click();await page.locator('#studioMediaUpload').setInputFiles({name:'produkt.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRz8AAAAASUVORK5CYII=','base64')});
 await expect(page.locator('[data-file]')).toHaveCount(1);page.once('dialog',d=>d.accept('Produkty'));await page.locator('[data-action=move-file]').click();await expect(page.locator('[data-file]')).toContainText('Produkty');await page.locator('[data-action=use-file]').click();
 await expect(page.locator('#testImage')).toHaveCSS('width','120px');await expect(page.locator('#testImage')).toHaveCSS('height','90px');
});
test('video crop and playback settings participate in undo',async({page})=>{
 await start(page);await page.evaluate(()=>{const v=document.createElement('video');v.id='testVideo';v.style.cssText='width:200px;height:120px';document.querySelector('#rafMain section').append(v);window.rafCore900.refresh();window.rafCore900.selectExact(v)});
 await page.locator('[data-prop=cropX]').fill('30');await page.locator('[data-prop=cropX]').press('Tab');await expect(page.locator('#testVideo')).toHaveCSS('object-position','30% 50%');
 await page.locator('[data-video=loop]').check();await expect(page.locator('#testVideo')).toHaveJSProperty('loop',true);await page.evaluate(()=>window.rafCore900.flush());await page.keyboard.press('Control+z');await expect(page.locator('#testVideo')).toHaveJSProperty('loop',false);
});
test('named version stores visual preview, restores draft and preserves current work backup',async({page})=>{
 await start(page);await page.locator('[data-action=versions]').click();await page.locator('#studioVersionName').fill('Przed zmianą');await page.locator('[data-action=capture-version]').click();await expect(page.locator('[data-version]')).toHaveCount(1);await expect(page.locator('[data-version] iframe')).toHaveCount(1);await page.locator('#studioClose910').click();
 await choose(page,'#sample');await page.locator('[data-prop=text]').fill('Zmieniona treść');await page.locator('[data-prop=text]').press('Tab');await expect(page.locator('#sample')).toHaveText('Zmieniona treść');
 await page.locator('[data-action=versions]').click();await page.locator('[data-action=restore-version]').click();await expect(page.locator('#sample')).toHaveText('Tekst próbny');const rows=await page.evaluate(()=>Object.values(window.__testDB.read('website/public/versionHistoryV76')));expect(rows.some(x=>x.meta.type==='before_rollback')).toBe(true);
});
test('saved section inserts linked copies and updates them together',async({page})=>{
 await start(page);await choose(page,'section[data-raf-section=Test]');page.once('dialog',d=>d.accept('Oferta RAF'));await page.locator('[data-action=save-section]').click();await expect(page.locator('[data-template]')).toHaveCount(1);
 await page.locator('[data-action=insert-linked]').click();await expect(page.locator('[data-raf-saved-section]')).toHaveCount(1);await page.locator('#studioLeft910 [data-action=sections]').click();await page.locator('[data-action=insert-linked]').click();await expect(page.locator('[data-raf-saved-section]')).toHaveCount(2);
 await choose(page,'#sample');await page.locator('[data-prop=text]').fill('Oferta 2026');await page.locator('[data-prop=text]').press('Tab');await page.locator('#studioLeft910 [data-action=sections]').click();await page.locator('[data-action=update-template]').click();await expect(page.locator('[data-raf-saved-section]').first()).toContainText('Oferta 2026');await expect(page.locator('[data-raf-saved-section]').last()).toContainText('Oferta 2026');
 await page.locator('#studioClose910').click();await publishFixture(page);await expect(page.locator('[data-raf-saved-section]')).toHaveCount(2);
});
test('brand styles render publicly, local override wins and undo restores brand',async({page})=>{
 await start(page);await page.locator('[data-action=brand]').click();await page.locator('#studioBrandEnabled').check();await page.locator('[data-brand=text]').fill('#00ff00');await page.locator('[data-action=save-brand]').click();await page.locator('#studioClose910').click();await expect(page.locator('#sample')).toHaveCSS('color','rgb(0, 255, 0)');
 await choose(page,'#sample');await page.locator('[data-prop=color]').fill('#ff0000');await page.locator('[data-prop=color]').dispatchEvent('change');await expect(page.locator('#sample')).toHaveCSS('color','rgb(255, 0, 0)');await page.locator('[data-reset=color]').click();await expect(page.locator('#sample')).toHaveCSS('color','rgb(0, 255, 0)');await publishFixture(page);await expect(page.locator('#sample')).toHaveCSS('color','rgb(0, 255, 0)');
});
test('validation lists broken links and selects the offending element',async({page})=>{
 await start(page);await page.evaluate(()=>{const a=document.createElement('a');a.id='testLink';a.textContent='Pusty przycisk';a.href='#';a.dataset.rafFree='1';document.querySelector('section').append(a);window.rafCore900.refresh()});
 await page.locator('[data-action=validate]').click();await page.getByRole('button',{name:/Przycisk lub link nie ma celu/}).click();await expect(page.locator('#testLink')).toHaveClass(/v72sel/);
 await page.locator('#pub3').click();await expect(page.locator('#v760publishCheck')).toContainText('WSKAŻ ELEMENT DO POPRAWY');await page.locator('#vpCancel').click();
});

test('mobile changes use the toolbar history and responsive preview renders each breakpoint',async({page})=>{
 await start(page);await page.locator('[data-device=mobile]').click();const child=page.frameLocator('#studioFrame910');await child.locator('#sample').click();
 await page.locator('[data-prop=fontSize]').fill('19');await page.locator('[data-prop=fontSize]').press('Tab');await expect(child.locator('#sample')).toHaveCSS('font-size','19px');
 await page.locator('#u3').click();await expect(child.locator('#sample')).toHaveCSS('font-size','24px');await page.locator('#r3').click();await expect(child.locator('#sample')).toHaveCSS('font-size','19px');
 await page.locator('[data-device=desktop]').click();await expect(page.locator('#sample')).toHaveCSS('font-size','24px');
 await choose(page,'#sample');await page.locator('[data-prop=color]').fill('#112233');await page.locator('[data-prop=color]').dispatchEvent('change');await page.locator('#studioSave910').click();
 await page.locator('#preview3').click();const preview=page.frameLocator('#studioResponsive910');await expect(preview.locator('#sample')).toHaveCSS('font-size','19px');await page.locator('[data-width="1440"]').click();await expect(preview.locator('#sample')).toHaveCSS('font-size','24px');
});

test('container modes and reset restore the original layout',async({page})=>{
 await start(page);await choose(page,'section[data-raf-section=Test]');await page.locator('[data-prop=containerMode]').selectOption('grid');await expect(page.locator('section[data-raf-section=Test]')).toHaveCSS('display','grid');await page.locator('[data-prop=columns]').fill('3');await page.locator('[data-prop=columns]').press('Tab');
 await page.locator('[data-reset=containerMode]').click();await expect(page.locator('section[data-raf-section=Test]')).toHaveCSS('display','block');await expect(page.locator('section[data-raf-section=Test]')).toHaveCSS('padding','20px');
});

test('saved section preserves mobile overrides after public reload',async({page})=>{
 await start(page);await page.evaluate(async()=>{const id=window.rafCore900.id(document.querySelector('#sample'));await window.__testDB.update('website/public/editorDraft/builder/freeLayoutV7/mobile',{[id]:{fontSize:17}})});
 await choose(page,'section[data-raf-section=Test]');page.once('dialog',d=>d.accept('Sekcja RWD'));await page.locator('[data-action=save-section]').click();await page.locator('[data-action=insert-copy]').click();await publishFixture(page);
 await page.setViewportSize({width:390,height:800});await expect(page.locator('[data-raf-saved-section] p').first()).toHaveCSS('font-size','17px');
 await page.setViewportSize({width:1440,height:900});await expect(page.locator('[data-raf-saved-section] p').first()).toHaveCSS('font-size','24px');
});

test('inspector scales multiple objects as a composition and undo restores their spacing',async({page})=>{
 await start(page);await page.evaluate(()=>{const c=window.rafCore900;c.selectElement(document.querySelector('[data-test=one]'));c.selectElement(document.querySelector('[data-test=two]'),true)});
 const bounds=()=>page.evaluate(()=>{const a=document.querySelector('[data-test=one]').getBoundingClientRect(),b=document.querySelector('[data-test=two]').getBoundingClientRect();return{width:b.right-a.left,first:a.width}});
 const before=await bounds();await page.locator('[data-prop=scale]').fill('65');await page.locator('[data-prop=scale]').press('Tab');const after=await bounds();expect(after.width/before.width).toBeCloseTo(.65,2);expect(after.first/before.first).toBeCloseTo(.65,2);
 await page.locator('#u3').click();expect((await bounds()).width).toBeCloseTo(before.width,1);
});

test('FAQ text remains editable in a saved section and opens publicly',async({page})=>{
 await start(page);await page.evaluate(async()=>{const d=document.createElement('details');d.innerHTML='<summary>Pytanie testowe</summary><p>Odpowiedź</p>';document.querySelector('section').append(d);await import('/accordion-runtime-v877.js');window.rafFaqRuntime877.refresh();window.rafCore900.refresh()});
 await choose(page,'.rafFaqText877');await page.locator('[data-prop=text]').fill('Jak zamówić sesję?');await page.locator('[data-prop=text]').press('Tab');
 page.once('dialog',d=>d.accept('FAQ'));await page.locator('[data-action=save-section]').click();await page.locator('[data-action=insert-copy]').click();await publishFixture(page);
 await expect(page.locator('[data-raf-saved-section] summary')).toHaveText('Jak zamówić sesję?');await page.locator('[data-raf-saved-section] summary').click();await expect(page.locator('[data-raf-saved-section] details')).toHaveAttribute('open','');
});

test('publication clears removed collections instead of retaining previous public values',async({page})=>{
 await start(page);await page.evaluate(async()=>{await window.__testDB.set('website/public/reviews',[{text:'Poprzednia opinia'}]);await window.__testDB.set('website/public/editorExtrasDraft',{reviews:[]})});
 await page.locator('#pub3').click();await page.locator('#vpGo').click();await expect.poll(()=>page.evaluate(()=>window.__testDB.read('website/public/publishedAt'))).toBeGreaterThan(0);
 expect(await page.evaluate(()=>window.__testDB.read('website/public/reviews'))).toBeNull();
});

test('version restore accepts Firebase normalization of empty nested objects',async({page})=>{
 await start(page);await page.evaluate(async()=>{const snapshot=await window.rafVersions760.readDraft(),db=window.__testDB,original=db.update;const normalize=v=>{if(v==null)return null;if(typeof v!=='object')return v;const entries=Object.entries(v).map(([k,x])=>[k,normalize(x)]).filter(([,x])=>x!==null);return entries.length?Object.fromEntries(entries):null};db.update=function(path,values){return original.call(this,path,Object.fromEntries(Object.entries(values).map(([k,v])=>[k,normalize(v)])))};await window.rafVersions760.restoreToDraft(snapshot)});
 await expect(page.locator('#sample')).toHaveText('Tekst próbny');
});

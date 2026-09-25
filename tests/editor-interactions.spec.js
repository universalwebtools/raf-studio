import {test,expect} from '@playwright/test';
import {openFixture} from './helpers/firebase.js';

const cfg=(page,selector)=>page.locator(selector).evaluate(el=>window.rafCore900.cfgFor(el));
async function drag(page,selector,dx,dy){
 const b=await page.locator(selector).boundingBox();
 await page.keyboard.down('Control');
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();
 await page.mouse.move(b.x+b.width/2+dx,b.y+b.height/2+dy,{steps:5});await page.mouse.up();
 await page.keyboard.up('Control');
 await page.waitForTimeout(180);
}

test('click, drag, immediate undo and redo restore geometry',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await openFixture(page);
 await drag(page,'#sample',46,27);expect((await cfg(page,'#sample')).x).toBe(46);
 await page.keyboard.press('Control+z');await expect.poll(async()=>(await cfg(page,'#sample')).x).toBe(0);
 await page.keyboard.press('Control+y');await expect.poll(async()=>(await cfg(page,'#sample')).x).toBe(46);
 expect(errors).toEqual([]);
});

test('Ctrl+A selects leaf objects without throwing or selecting their parent',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await openFixture(page);await page.locator('#sample').click();
 await page.keyboard.press('Control+a');
 const selection=await page.evaluate(()=>window.rafCore900.selected().map(x=>x.tagName));
 expect(selection.length).toBeGreaterThan(2);expect(selection).not.toContain('SECTION');expect(errors).toEqual([]);
});

test('inline text survives public rendering and undo',async({page})=>{
 await openFixture(page);await page.locator('#sample').dblclick();await page.locator('#sample').fill('Tekst po edycji');
 await page.keyboard.press('Control+Enter');await page.waitForTimeout(750);
 await expect(page.locator('#sample')).toHaveText('Tekst po edycji');
 await page.keyboard.press('Control+z');await expect(page.locator('#sample')).toHaveText('Tekst próbny');
 await page.keyboard.press('Control+y');await expect(page.locator('#sample')).toHaveText('Tekst po edycji');
 await page.evaluate(()=>{const s=window.__testDB.read('website/public/editorDraft');return window.__testDB.update('website/public',s)});
 await page.goto('/tests/fixtures/canvas.html');await expect(page.locator('#sample')).toHaveText('Tekst po edycji');
});

test('stable object identity survives a flow reorder and refresh',async({page})=>{
 await openFixture(page);const one=page.locator('[data-test="one"]');const id=await one.getAttribute('data-raf-v72-id');
 await one.click();await page.evaluate(()=>window.rafCore900.flowDown());await page.waitForTimeout(900);
 expect(await one.getAttribute('data-raf-v72-id')).toBe(id);
 await page.reload();await page.waitForFunction(()=>window.rafCore900);await page.waitForTimeout(900);
 expect(await one.getAttribute('data-raf-v72-id')).toBe(id);
 expect(await page.locator('.row > p').allTextContents()).toEqual(['Drugi','Pierwszy']);
});

test('renderer becomes idle after reordered elements settle',async({page})=>{
 await openFixture(page);await page.locator('[data-test="one"]').click();await page.evaluate(()=>window.rafCore900.flowDown());
 await page.waitForTimeout(1000);await page.evaluate(()=>{window.__renderCount=0;addEventListener('raf:renderer900-applied',()=>window.__renderCount++)});
 await page.waitForTimeout(700);expect(await page.evaluate(()=>window.__renderCount)).toBeLessThan(3);
});

test('undo waits for a pending save and a failed undo can be retried',async({page})=>{
 await openFixture(page);await page.locator('#sample').click();
 await page.evaluate(()=>window.rafCore900.patchSelected({x:81}));
 await page.keyboard.press('Control+z');await expect.poll(async()=>(await cfg(page,'#sample')).x).toBe(0);
 await page.keyboard.press('Control+y');await expect.poll(async()=>(await cfg(page,'#sample')).x).toBe(81);
 await page.evaluate(()=>window.__testDB.failNext=true);await page.keyboard.press('Control+z');
 await expect(page.locator('#rafStatus3')).toContainText('Test write failure');expect((await cfg(page,'#sample')).x).toBe(81);
 await page.keyboard.press('Control+z');await expect.poll(async()=>(await cfg(page,'#sample')).x).toBe(0);
});

test('duplicate, undo, redo and public reload keep exactly one independent clone',async({page})=>{
 await openFixture(page);await page.locator('[data-test="one"]').click();await page.evaluate(()=>window.rafCore900.duplicate());
 await expect(page.locator('[data-raf-v76-clone]')).toHaveCount(1);await page.keyboard.press('Control+z');
 await expect(page.locator('[data-raf-v76-clone]')).toHaveCount(0);await page.keyboard.press('Control+y');
 await expect(page.locator('[data-raf-v76-clone]')).toHaveCount(1);
 await page.locator('[data-raf-v76-clone]').click();await page.evaluate(()=>window.rafCore900.patchSelected({text:'Kopia'}));await page.evaluate(()=>window.rafCore900.flush());
 await page.evaluate(()=>window.__testDB.update('website/public',window.__testDB.read('website/public/editorDraft')));
 await page.goto('/tests/fixtures/canvas.html');await expect(page.locator('[data-raf-v76-clone]')).toHaveText('Kopia');
 await expect(page.locator('[data-test="one"]:not([data-raf-v76-clone])')).toHaveText('Pierwszy');
});

test('multi-selection scales to 65 percent, groups select together, and undo restores geometry',async({page})=>{
 await openFixture(page);await page.locator('[data-test="one"]').click();await page.locator('[data-test="two"]').click({modifiers:['Shift']});
 await expect(page.locator('#v72box')).toHaveClass(/multi/);
 const box=await page.locator('#v72box').boundingBox(),handle=await page.locator('[data-dir="se"]').boundingBox();
 await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width*.65,box.y+box.height*.65,{steps:5});await page.mouse.up();
 await expect.poll(async()=>(await cfg(page,'[data-test="one"]')).scale).toBeCloseTo(.65,1);
 await page.keyboard.press('Control+z');await expect.poll(async()=>(await cfg(page,'[data-test="one"]')).scale).toBe(1);
 await page.keyboard.press('Control+g');await page.waitForTimeout(200);await page.evaluate(()=>window.rafCore900.clear());await page.locator('[data-test="one"]').click();
 expect(await page.evaluate(()=>window.rafCore900.selected().length)).toBe(2);
});

test('mobile overrides do not alter desktop and styles survive reset',async({page})=>{
 await openFixture(page);await page.locator('[data-test="one"]').click();await page.evaluate(()=>window.rafCore900.patchSelected({x:35,color:'#ff0000'}));await page.evaluate(()=>window.rafCore900.flush());
 await page.goto('/tests/fixtures/canvas.html?editor=direct&device=mobile');await page.waitForFunction(()=>window.rafCore900);
 await page.locator('[data-test="one"]').click();await page.evaluate(()=>window.rafCore900.patchSelected({x:75}));await page.evaluate(()=>window.rafCore900.flush());
 const data=await page.evaluate(()=>window.__testDB.read('website/public/editorDraft/builder/freeLayoutV7'));
 const id=await page.locator('[data-test="one"]').getAttribute('data-raf-v72-id');expect(data.desktop[id].x).toBe(35);expect(data.mobile[id].x).toBe(75);
 await page.evaluate(()=>window.rafCore900.clearProps(window.rafCore900.selected()[0],['x']));expect((await cfg(page,'[data-test="one"]')).x).toBe(35);
});

test('template inline typography survives a transform and a cleared override',async({page})=>{
 await openFixture(page);await expect(page.locator('#sample')).toHaveCSS('color','rgb(170, 40, 70)');await expect(page.locator('#sample')).toHaveCSS('font-size','24px');
 await drag(page,'#sample',12,10);await expect(page.locator('#sample')).toHaveCSS('font-size','24px');
 await page.evaluate(()=>window.rafCore900.patchSelected({fontSize:40}));await expect(page.locator('#sample')).toHaveCSS('font-size','40px');
 await page.evaluate(()=>window.rafCore900.clearProps(window.rafCore900.selected()[0],['fontSize']));await expect(page.locator('#sample')).toHaveCSS('font-size','24px');
});

test('locked objects resist Delete and canvas overlays leave preview inert',async({page})=>{
 await openFixture(page);await page.locator('#sample').click();await page.evaluate(()=>window.rafCore900.toggleLocked());
 await page.keyboard.press('Delete');await expect(page.locator('#sample')).toBeVisible();
 await page.evaluate(()=>window.rafHistory900.preview(true));await expect(page.locator('#v72box')).toBeHidden();
 await drag(page,'#sample',50,20);expect((await cfg(page,'#sample')).x).toBe(0);
});

test('corner resize keeps proportions and the opposite corner fixed after scaling',async({page})=>{
 await openFixture(page);const el=page.locator('[data-test="free"]');await el.click();
 await page.evaluate(()=>window.rafCore900.patchSelected({scale:1.5}));await page.evaluate(()=>window.rafCore900.flush());
 const before=await el.boundingBox(),handle=await page.locator('[data-dir="se"]').boundingBox();
 await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();
 await page.mouse.move(handle.x+handle.width/2+60,handle.y+handle.height/2+24,{steps:5});await page.mouse.up();
 const after=await el.boundingBox();expect(after.width/after.height).toBeCloseTo(before.width/before.height,1);
 expect(after.x).toBeCloseTo(before.x,0);expect(after.y).toBeCloseTo(before.y,0);expect(after.width-before.width).toBeCloseTo(60,0);
 await page.keyboard.press('Control+z');await expect.poll(async()=>(await el.boundingBox()).width).toBeCloseTo(before.width,0);
});

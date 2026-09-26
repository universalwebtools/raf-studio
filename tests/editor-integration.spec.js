import {test,expect} from '@playwright/test';
import {mockFirebase,seed} from './helpers/firebase.js';

test('complete editor boots, remains idle and publishes text to the same public renderer',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await mockFirebase(page,seed());
 await page.goto('/?editor=direct');await page.waitForFunction(()=>window.rafCore900&&window.rafSafePublish760&&window.rafVersions760);
 await page.waitForTimeout(1500);
 await page.evaluate(()=>{window.__count=0;addEventListener('raf:renderer900-applied',()=>window.__count++)});
 await page.locator('[data-site-text="heroT"]:visible,#heroT:visible').first().click();await page.waitForTimeout(300);await page.evaluate(()=>window.__count=0);
 await page.waitForTimeout(700);expect(await page.evaluate(()=>window.__count)).toBeLessThan(4);
 await page.locator('[data-site-text="heroT"]:visible,#heroT:visible').first().dblclick();await page.locator('[data-site-text="heroT"]:visible,#heroT:visible').first().fill('RAF — test publikacji');await page.keyboard.press('Control+Enter');
 await page.locator('#pub3').click();await page.locator('#vpGo').click();
 await expect.poll(()=>page.evaluate(()=>window.__testDB.read('website/public/publishedAt')),{timeout:20000}).toBeGreaterThan(0);
 await page.goto('/');await expect(page.locator('[data-site-text="heroT"]:visible,#heroT:visible').first()).toHaveText('RAF — test publikacji');
 expect(errors).toEqual([]);
});

test('template picker creates a backed-up draft without replacing the public page',async({page})=>{
 await mockFirebase(page,seed());await page.goto('/?editor=direct');await page.waitForFunction(()=>window.rafStudio910);await page.locator('#studioLeft910 [data-action=templates]').click();
 await page.locator('.tp752card').nth(1).click();page.once('dialog',d=>d.accept());await page.locator('#tp752full').click();await page.waitForFunction(()=>window.rafStudio910);
 await expect.poll(()=>page.evaluate(()=>window.__testDB.read('website/public/editorDraft/site/heroT'))).not.toBe('Test RAF');
 expect(await page.evaluate(()=>window.__testDB.read('website/public/site/heroT'))).toBe('Test RAF');
 expect(await page.evaluate(()=>Object.values(window.__testDB.read('website/public/versionHistoryV76')).some(v=>v.meta.type==='before_template'))).toBe(true);
});

test('header settings stay accessible and do not replace the studio inspector',async({page})=>{
 await mockFirebase(page,seed());await page.goto('/?editor=direct');await page.waitForFunction(()=>window.rafStudio910);await page.locator('#studioLeft910 [data-action=header]').click();await expect(page.locator('#studioHeaderHost910')).toBeVisible();
 await page.locator('#rafHeaderDone900').click();await page.locator('[data-site-text="heroT"]:visible,#heroT:visible').first().click();await expect(page.locator('#studioInspector910')).toContainText('Typografia');
});

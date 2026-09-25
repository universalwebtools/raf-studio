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

import {test,expect} from '@playwright/test';
import {mockFirebase,seed} from './helpers/firebase.js';
test.beforeEach(async({page})=>mockFirebase(page,seed()));

test('desktop header and social icons stay sane',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('.rafHeader900',{state:'visible'});
 const icons=page.locator('.rafHeaderSocial900 a:visible');
 await expect(icons).toHaveCount(4);
 await expect.poll(()=>icons.evaluateAll(nodes=>nodes.length===4&&nodes.every(n=>{const r=n.getBoundingClientRect();return r.width>=14&&r.width<=72&&r.height>=14&&r.height<=72}))).toBe(true);
 await expect(page.locator('#rafTop3')).toHaveCount(0);
});

test('mobile header keeps social icons next to hamburger',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('.rafHeader900',{state:'visible'});
 await expect(page.locator('.rafHeaderSocial900 a:visible')).toHaveCount(4);
 await expect(page.locator('.rafHeaderToggle900')).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(2);
});

test('public page has no editor overlays',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});
 for(const sel of ['#v72box','#rafPanel3','#rafTop3','#v760layers','.v72marq'])await expect(page.locator(sel)).toHaveCount(0);
});

import {test,expect} from '@playwright/test';

test('desktop header and social icons stay sane',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('.rafHeader900',{state:'visible'});
 const icons=page.locator('.rafHeaderSocial900 a:visible');
 await expect(icons).toHaveCount(4);
 const sizes=await icons.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{w:r.width,h:r.height}}));
 for(const s of sizes){expect(s.w).toBeGreaterThanOrEqual(14);expect(s.w).toBeLessThanOrEqual(72);expect(s.h).toBeLessThanOrEqual(72)}
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

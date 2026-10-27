import assert from 'node:assert/strict';
import {fitTemplateLayout} from '../template-layout-fit-v893.js';
// Published values that previously clipped the header and the mobile menu.
const layout={desktop:{'section:Hero':{width:4197,height:1700,x:-828.5,y:-336,scale:.61},'tx:heroT':{text:'OBRAZ, KTÓRY ZOSTAJE.',x:215,y:-89,scale:2.3527,color:'#777'}}};
const hero={family:'roj',hero:true,width:1348};
assert.deepEqual(fitTemplateLayout(layout,'el:unmodified-navigation','mobile',hero),{});
assert.deepEqual(fitTemplateLayout(layout,'section:Hero','desktop',hero),{width:null,height:null,x:0,y:0,scale:1,rotate:0});
const phone=fitTemplateLayout(layout,'tx:heroT','mobile',{...hero,width:375});
assert.equal(phone.text,'OBRAZ, KTÓRY ZOSTAJE.');assert.equal(phone.color,'#777');assert.equal(phone.scale,1);assert.equal(phone.x,0);
assert.deepEqual(fitTemplateLayout(layout,'section:Hero','desktop',{...hero,width:2560}),layout.desktop['section:Hero']);
assert.deepEqual(fitTemplateLayout(layout,'tx:heroT','desktop',{...hero,hero:false}),layout.desktop['tx:heroT']);
assert.deepEqual(fitTemplateLayout(layout,'tx:heroT','mobile',{...hero,family:'cam'}),layout.desktop['tx:heroT']);
layout.mobile={'tx:heroT':{x:8,scale:1.1}};
assert.equal(fitTemplateLayout(layout,'tx:heroT','mobile',hero).x,8);
assert.equal(fitTemplateLayout(layout,'tx:heroT','mobile',hero).scale,1.1);
layout.mobile['section:Hero']={width:360,height:700,x:0,y:0,scale:1};
assert.deepEqual(fitTemplateLayout(layout,'section:Hero','mobile',hero),layout.mobile['section:Hero']);
console.log('PASS: oversized published hero reflows on desktop/phone; content, wide-screen design, explicit device settings and other templates preserved.');

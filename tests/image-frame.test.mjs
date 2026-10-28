import assert from 'node:assert/strict';
import {cropGeometry,panCrop} from '../image-frame-v893.js';

// A landscape photo in a portrait frame: moving the source 40px must move
// the visible subject 40px, independent of frame width or crop percentage.
const crop={x:50,y:50,zoom:1,fit:'cover'};
const g=cropGeometry(300,500,1600,900,crop);
assert.equal(g.imageHeight,500);
assert.ok(g.imageWidth>800);
const moved=panCrop(crop,g,40,50),next=cropGeometry(300,500,1600,900,moved);
assert.ok(Math.abs(next.left-g.left-40)<.00001);
assert.equal(moved.y,50); // no unused pixels vertically at 1x
const zoomed=cropGeometry(300,500,1600,900,{...crop,zoom:2});
assert.equal(zoomed.width,300);assert.equal(zoomed.height,500);
assert.equal(zoomed.imageHeight,1000);
assert.equal(panCrop(crop,zoomed,100000,100000).x,0);
assert.equal(panCrop(crop,zoomed,-100000,-100000).y,100);
const contain=cropGeometry(400,400,1600,900,{...crop,fit:'contain'});
assert.equal(contain.imageWidth,400);assert.equal(contain.imageHeight,225);
assert.equal(contain.top,87.5);
assert.ok(Object.values(cropGeometry(0,0,0,0)).every(Number.isFinite));
console.log('PASS: fixed crop frame, source pan distance, zoom, edge clamps, contain and unloaded dimensions');

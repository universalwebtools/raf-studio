import {imageMetrics,panCrop} from './image-frame-v893.js?v=893-crop-1';

// A viewport overlay shows only the unused source pixels. It never enters saved
// markup or the published runtime; the real image still clips to its own frame.
export function createCropPreview(core,onChange=()=>{}){
 let active=null,canvas=null,drag=null,raf=0,last='',suppressClick=false;
 const crop=()=>({x:50,y:50,zoom:1,fit:'cover',...(active?core.cfgFor(active).crop:{})});
 function refresh(){
  if(raf||!active)return;
  raf=requestAnimationFrame(()=>{raf=0;draw()});
 }
 function draw(){
  if(!active?.isConnected||core.selected().length!==1||core.selected()[0]!==active||document.body.classList.contains('raf-preview64')){stop();return}
  if(!active.naturalWidth)return;
  const {matrix:m,geometry:g}=imageMetrics(active,crop()),dpr=devicePixelRatio||1;
  const key=[innerWidth,innerHeight,dpr,m.toString(),JSON.stringify(g),active.currentSrc].join('|');if(key===last)return;last=key;
  canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.transform(m.a,m.b,m.c,m.d,m.e,m.f);
  ctx.globalAlpha=.5;ctx.drawImage(active,g.left,g.top,g.imageWidth,g.imageHeight);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-out';ctx.fillRect(0,0,g.width,g.height);
  ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#ff3aa6';ctx.lineWidth=1.5/Math.max(.1,Math.hypot(m.a,m.b));ctx.strokeRect(0,0,g.width,g.height);
  ctx.globalAlpha=.45;ctx.strokeStyle='#fff';ctx.beginPath();
  for(const f of [1/3,2/3]){ctx.moveTo(g.width*f,0);ctx.lineTo(g.width*f,g.height);ctx.moveTo(0,g.height*f);ctx.lineTo(g.width,g.height*f)}ctx.stroke();
 }
 function start(img){
  stop();active=img;last='';canvas=document.createElement('canvas');canvas.id='rafCropPreview893';canvas.setAttribute('aria-hidden','true');
  canvas.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:1000012';document.body.appendChild(canvas);
  document.body.classList.add('raf-crop-active');active.classList.add('v760cropActive');onChange();refresh();
 }
 function stop(){
  if(drag)core.save();drag=null;if(raf)cancelAnimationFrame(raf);raf=0;
  active?.classList.remove('v760cropActive');active=null;canvas?.remove();canvas=null;last='';document.body.classList.remove('raf-crop-active');onChange();
 }
 function pointerDown(e){
  if(!active||e.button!==0||e.target.closest('#rafTop3,#rafPanel3,#v72box,#v760layers,#v760menu'))return false;
  const metrics=imageMetrics(active,crop()),p=metrics.matrix.inverse().transformPoint({x:e.clientX,y:e.clientY}),g=metrics.geometry;
  const inFrame=p.x>=0&&p.x<=g.width&&p.y>=0&&p.y<=g.height,inImage=p.x>=g.left&&p.x<=g.left+g.imageWidth&&p.y>=g.top&&p.y<=g.top+g.imageHeight;
  if(!inFrame&&!inImage){stop();return false}
  e.preventDefault();e.stopImmediatePropagation();core.checkpoint();suppressClick=true;
  drag={pid:e.pointerId,start:p,crop:crop(),...metrics};try{active.setPointerCapture(e.pointerId)}catch{}return true;
 }
 function pointerMove(e){
  if(!drag||drag.pid!==e.pointerId)return false;
  e.preventDefault();e.stopImmediatePropagation();const p=drag.matrix.inverse().transformPoint({x:e.clientX,y:e.clientY});
  core.patchOne(active,{crop:panCrop(drag.crop,drag.geometry,p.x-drag.start.x,p.y-drag.start.y)},{commitNow:false});refresh();return true;
 }
 function pointerUp(e){if(!drag||drag.pid!==e.pointerId)return;drag=null;core.save();refresh()}
 addEventListener('scroll',refresh,{capture:true,passive:true});addEventListener('resize',refresh,{passive:true});addEventListener('raf:image-frame-loaded',refresh);
 addEventListener('raf:v760-change',refresh);addEventListener('raf:v760-selection',refresh);
 addEventListener('click',e=>{if(suppressClick){suppressClick=false;e.preventDefault();e.stopImmediatePropagation()}},true);
 new MutationObserver(refresh).observe(document.body,{attributes:true,attributeFilter:['class']});
 return {start,stop,refresh,pointerDown,pointerMove,pointerUp,get active(){return active}};
}

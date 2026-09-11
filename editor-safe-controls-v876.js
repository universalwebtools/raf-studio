// RAF.studio — safe selection controls v8.7.6
// Keeps move/action controls and resize handles inside the visible editor viewport.
// Especially important in the phone/tablet mockup, where the iframe clips anything
// outside the device screen. Multi-select corner scaling is handled here with a
// delta-based algorithm so a clamped handle never makes the group jump.
(function(){
 if(!new URLSearchParams(location.search).has('editor'))return;
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 const params=new URLSearchParams(location.search),embedded=params.has('embedded');
 const M=10;
 let core=null,scaleDrag=null,tick=0;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function stamp(){
  const small=$('#v72panel small');if(small&&/V8\.7\.2 CORE/i.test(small.textContent))small.textContent=small.textContent.replace(/V8\.7\.2 CORE/i,'V8.7.6 CORE');
  document.documentElement.dataset.rafEditorCurrent='8.7.6'
 }
 function css(){
  if($('#rafSafe876Css'))return;
  const s=document.createElement('style');s.id='rafSafe876Css';s.textContent=`
body.raf-safe-controls876 #v72box{overflow:visible!important}
body.raf-safe-controls876 #v72move,body.raf-safe-controls876 #v72flow,body.raf-safe-controls876 #v72box .v760handle{position:fixed!important;z-index:1000065!important}
body.raf-safe-controls876 #v72move{margin:0!important;white-space:nowrap!important}
body.raf-safe-controls876 #v72flow{right:auto!important;bottom:auto!important;max-width:calc(100vw - 12px)!important;display:flex!important;flex-wrap:wrap!important;white-space:normal!important;gap:3px!important}
body.raf-safe-controls876 #v72flow button{padding:5px 6px!important;font-size:8px!important;line-height:1!important}
body.raf-safe-controls876 #v72box .v760handle{margin:0!important;transform:translate(-50%,-50%)!important;width:14px!important;height:14px!important;box-sizing:border-box!important}
body.raf-safe-controls876 #v72rotate{display:none!important}
#rafScale876{position:fixed;z-index:1000075;display:none;pointer-events:none;padding:5px 8px;border-radius:7px;background:#9835d5;color:#fff;font:800 10px system-ui;box-shadow:0 5px 18px #0008}
`;
  document.head.appendChild(s)
 }
 function selected(){core=core||window.rafCore760||window.rafCore72;return core?.selected?.().filter(el=>el?.isConnected&&el.getClientRects().length)||[]}
 function bounds(items){
  const rs=items.map(x=>x.getBoundingClientRect()).filter(r=>r.width||r.height);if(!rs.length)return null;
  const left=Math.min(...rs.map(r=>r.left)),top=Math.min(...rs.map(r=>r.top)),right=Math.max(...rs.map(r=>r.right)),bottom=Math.max(...rs.map(r=>r.bottom));
  return{left,top,right,bottom,width:right-left,height:bottom-top}
 }
 function resetNative(){
  document.body.classList.remove('raf-safe-controls876');
  const nodes=[$('#v72move'),$('#v72flow'),...$$('#v72box .v760handle')].filter(Boolean);
  for(const el of nodes)for(const p of ['position','left','top','right','bottom','margin','transform','z-index','max-width','flex-wrap','white-space'])el.style.removeProperty(p)
 }
 function needsSafe(b){
  if(embedded)return true;
  if(!b)return false;
  if(b.left<M||b.top<54||b.right>innerWidth-M||b.bottom>innerHeight-M)return true;
  for(const el of [$('#v72move'),$('#v72flow')]){if(!el)continue;const r=el.getBoundingClientRect();if(r.left<M||r.top<M||r.right>innerWidth-M||r.bottom>innerHeight-M)return true}
  return false
 }
 function pointFor(dir,b){
  const x=dir.includes('w')?b.left:dir.includes('e')?b.right:b.left+b.width/2;
  const y=dir.includes('n')?b.top:dir.includes('s')?b.bottom:b.top+b.height/2;
  return{x:clamp(x,M,Math.max(M,innerWidth-M)),y:clamp(y,M,Math.max(M,innerHeight-M))}
 }
 function controlsY(b){
  const h=62;
  if(b.top>=h+M)return b.top-h;
  if(innerHeight-b.bottom>=h+M)return b.bottom+7;
  return M
 }
 function position(){
  stamp();css();core=core||window.rafCore760||window.rafCore72;
  const items=selected(),box=$('#v72box');if(!core||!items.length||!box){resetNative();return}
  const b=bounds(items);if(!needsSafe(b)){resetNative();return}
  document.body.classList.add('raf-safe-controls876');
  const move=$('#v72move'),flow=$('#v72flow'),baseY=clamp(controlsY(b),M,Math.max(M,innerHeight-60)),baseX=clamp(b.left,M,Math.max(M,innerWidth-110));
  if(move){move.style.left=baseX+'px';move.style.top=baseY+'px'}
  if(flow){flow.style.left=clamp(b.left,M,Math.max(M,innerWidth-300))+'px';flow.style.top=clamp(baseY+29,M,Math.max(M,innerHeight-30))+'px'}
  for(const h of $$('#v72box .v760handle')){
   if(getComputedStyle(h).display==='none')continue;
   const p=pointFor(h.dataset.dir||'',b);h.style.left=p.x+'px';h.style.top=p.y+'px'
  }
 }
 function badge(){let b=$('#rafScale876');if(!b){b=document.createElement('div');b.id='rafScale876';document.body.appendChild(b)}return b}
 function startMultiScale(e,h){
  const items=selected();if(items.length<2)return false;const dir=h.dataset.dir||'';if(dir.length!==2)return false;
  const b=bounds(items);if(!b)return false;const unlocked=items.filter(el=>!core.cfgFor(el)?.locked);if(unlocked.length<2)return false;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();core.checkpoint?.();
  const anchorX=dir.includes('w')?b.right:b.left,anchorY=dir.includes('n')?b.bottom:b.top,cornerX=dir.includes('w')?b.left:b.right,cornerY=dir.includes('n')?b.top:b.bottom;
  scaleDrag={pid:e.pointerId,sx:e.clientX,sy:e.clientY,anchorX,anchorY,vx:cornerX-anchorX,vy:cornerY-anchorY,items:unlocked.map(el=>{const c=core.cfgFor(el),r=el.getBoundingClientRect();return{el,x:Number(c.x)||0,y:Number(c.y)||0,scale:Number(c.scale)||1,cx:r.left+r.width/2,cy:r.top+r.height/2}}),factor:1};
  const lab=badge();lab.textContent='100%';lab.style.display='block';lab.style.left=clamp(e.clientX+10,5,innerWidth-58)+'px';lab.style.top=clamp(e.clientY+10,5,innerHeight-26)+'px';
  try{h.setPointerCapture(e.pointerId)}catch{}
  return true
 }
 function scaleMove(e){
  const d=scaleDrag;if(!d||e.pointerId!==d.pid)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const den=Math.max(1,d.vx*d.vx+d.vy*d.vy),dx=e.clientX-d.sx,dy=e.clientY-d.sy;let f=1+(dx*d.vx+dy*d.vy)/den;f=clamp(f,.1,4);if(e.shiftKey)f=Math.max(.1,Math.round(f*20)/20);d.factor=f;
  for(const i of d.items){const tx=d.anchorX+(i.cx-d.anchorX)*f,ty=d.anchorY+(i.cy-d.anchorY)*f;core.patchOne(i.el,{x:i.x+(tx-i.cx),y:i.y+(ty-i.cy),scale:Math.round(i.scale*f*10000)/10000},{commitNow:false})}
  const lab=badge();lab.textContent=Math.round(f*100)+'%';lab.style.left=clamp(e.clientX+10,5,innerWidth-58)+'px';lab.style.top=clamp(e.clientY+10,5,innerHeight-26)+'px';position()
 }
 function scaleEnd(e){
  if(!scaleDrag||e.pointerId!==scaleDrag.pid)return;const f=scaleDrag.factor,count=scaleDrag.items.length;scaleDrag=null;const lab=badge();lab.style.display='none';const st=$('#rafStatus3');if(st)st.textContent='✓ '+count+' elementów przeskalowano do '+Math.round(f*100)+'% • Ctrl+Z cofa całość';position()
 }
 window.addEventListener('pointerdown',e=>{if(!document.body.classList.contains('raf-safe-controls876'))return;const h=e.target.closest?.('#v72box .v760handle[data-dir]');if(!h)return;const items=selected();if(items.length>1)startMultiScale(e,h)},true);
 window.addEventListener('pointermove',scaleMove,true);window.addEventListener('pointerup',scaleEnd,true);window.addEventListener('pointercancel',scaleEnd,true);
 for(const ev of ['raf:v760-selection','raf:v760-change','raf:v760-layers','raf:template752-rendered','raf:universal-elements-ready'])window.addEventListener(ev,()=>requestAnimationFrame(position));
 addEventListener('scroll',()=>requestAnimationFrame(position),{passive:true});addEventListener('resize',()=>requestAnimationFrame(position),{passive:true});
 new MutationObserver(()=>{clearTimeout(tick);tick=setTimeout(position,20)}).observe(document.documentElement,{subtree:true,childList:true});
 setInterval(position,120);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',position,{once:true});else position();
 window.rafSafeControls876={refresh:position};
})();

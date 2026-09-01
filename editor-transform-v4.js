const frame=document.querySelector('#siteFrame');
const q=s=>document.querySelector(s);
let active=null;

function num(sel,fallback=0){const n=Number(q(sel)?.value);return Number.isFinite(n)?n:fallback}
function selectedEl(){return frame?.contentDocument?.querySelector('.ve-selected')||null}
function applyLive(el,x,y,scale,rotate){
  if(!el)return;
  el.style.transformOrigin='center center';
  el.style.transform=`translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
  el.style.position='relative';
  el.style.zIndex='4';
}
function updateFields(x,y,scale,rotate){
  if(q('#iMoveX'))q('#iMoveX').value=Math.round(x);
  if(q('#iMoveY'))q('#iMoveY').value=Math.round(y);
  if(q('#iScale'))q('#iScale').value=Number(scale).toFixed(2);
  if(q('#iRotate'))q('#iRotate').value=Math.round(rotate);
}
function commit(){
  for(const id of ['#iMoveX','#iMoveY','#iScale','#iRotate']){
    const el=q(id);if(el)el.dispatchEvent(new Event('input',{bubbles:true}));
  }
}
function start(mode,e,handle){
  const el=selectedEl();if(!el)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  try{handle.setPointerCapture(e.pointerId)}catch{}
  const r=el.getBoundingClientRect();
  const cx=r.left+r.width/2,cy=r.top+r.height/2;
  const sx=e.clientX,sy=e.clientY;
  active={mode,handle,pointerId:e.pointerId,el,sx,sy,cx,cy,
    x:num('#iMoveX',0),y:num('#iMoveY',0),scale:num('#iScale',1),rotate:num('#iRotate',0),
    dist:Math.max(10,Math.hypot(sx-cx,sy-cy)),angle:Math.atan2(sy-cy,sx-cx)};
}
function move(e){
  if(!active||e.pointerId!==active.pointerId)return;
  e.preventDefault();e.stopPropagation();
  let {x,y,scale,rotate}=active;
  if(active.mode==='move'){
    x=active.x+(e.clientX-active.sx);
    y=active.y+(e.clientY-active.sy);
  }else if(active.mode==='scale'){
    const d=Math.max(10,Math.hypot(e.clientX-active.cx,e.clientY-active.cy));
    scale=Math.max(.2,Math.min(4,active.scale*(d/active.dist)));
  }else if(active.mode==='rotate'){
    const a=Math.atan2(e.clientY-active.cy,e.clientX-active.cx);
    rotate=active.rotate+(a-active.angle)*180/Math.PI;
    if(e.shiftKey)rotate=Math.round(rotate/15)*15;
  }
  applyLive(active.el,x,y,scale,rotate);
  updateFields(x,y,scale,rotate);
}
function end(e){
  if(!active||e.pointerId!==active.pointerId)return;
  e.preventDefault();e.stopPropagation();
  try{active.handle.releasePointerCapture(active.pointerId)}catch{}
  active=null;
  commit();
}
function install(){
  const d=frame?.contentDocument;if(!d||d.documentElement.dataset.rafTransformV4==='1')return;
  d.documentElement.dataset.rafTransformV4='1';
  d.addEventListener('pointerdown',e=>{
    const h=e.target.closest?.('.ve-move-handle,.ve-handle.scale,.ve-handle.rotate');
    if(!h)return;
    const mode=h.classList.contains('ve-move-handle')?'move':h.classList.contains('scale')?'scale':'rotate';
    start(mode,e,h);
  },true);
  d.addEventListener('pointermove',move,true);
  d.addEventListener('pointerup',end,true);
  d.addEventListener('pointercancel',end,true);
}
frame?.addEventListener('load',()=>setTimeout(install,100));
if(frame?.contentDocument?.readyState==='complete')setTimeout(install,100);

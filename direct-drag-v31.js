// RAF.studio — stabilny rdzeń drag dla direct-editor-v3
// Przejmuje tylko uchwyty transformacji. Reszta edytora pozostaje bez zmian.
const qs=(s,r=document)=>r.querySelector(s);
let active=null;

function field(id,fallback=0){
  const el=qs(id); if(!el)return fallback;
  const n=Number(el.value); return Number.isFinite(n)?n:fallback;
}
function selected(){return qs('.rsel')}
function overlay(){return qs('.rbox3')}
function updateOverlay(el){
  const box=overlay(); if(!box||!el)return;
  const r=el.getBoundingClientRect();
  box.style.left=`${r.left+scrollX}px`;
  box.style.top=`${r.top+scrollY}px`;
  box.style.width=`${r.width}px`;
  box.style.height=`${r.height}px`;
}
function apply(el,x,y,scale,rotate,width){
  if(!el)return;
  if(width>0){el.style.width=`${width}px`;el.style.maxWidth=`${width}px`}
  el.style.transformOrigin='center center';
  el.style.transform=`translate(${x}px,${y}px) rotate(${rotate}deg) scale(${scale})`;
  el.style.position='relative';
  updateOverlay(el);
}
function syncFields(a){
  const map=[['#x3',a.x],['#y3',a.y],['#sc3',a.scale],['#rot3',a.rotate],['#w3',a.width]];
  for(const [id,v] of map){const el=qs(id);if(el)el.value=id==='#sc3'?Number(v).toFixed(2):Math.round(v)}
}
function commit(){
  // v3 zapisuje stan przez onchange pól inspektora.
  // Wysyłamy zmianę dopiero raz po puszczeniu myszy — bez lagów podczas dragowania.
  for(const id of ['#x3','#y3','#sc3','#rot3','#w3']){
    const el=qs(id); if(el)el.dispatchEvent(new Event('change',{bubbles:true}));
  }
}
function begin(e,mode,handle){
  const el=selected(); if(!el)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const r=el.getBoundingClientRect();
  const x=field('#x3',0),y=field('#y3',0),scale=field('#sc3',1),rotate=field('#rot3',0),width=field('#w3',r.width)||r.width;
  const cx=r.left+r.width/2,cy=r.top+r.height/2;
  active={mode,handle,pid:e.pointerId,el,sx:e.clientX,sy:e.clientY,x,y,scale,rotate,width,cx,cy,
    dist:Math.max(10,Math.hypot(e.clientX-cx,e.clientY-cy)),angle:Math.atan2(e.clientY-cy,e.clientX-cx)};
  try{handle.setPointerCapture(e.pointerId)}catch{}
}
function move(e){
  const a=active;if(!a||e.pointerId!==a.pid)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  let x=a.x,y=a.y,scale=a.scale,rotate=a.rotate,width=a.width;
  if(a.mode==='move'){
    x=a.x+(e.clientX-a.sx); y=a.y+(e.clientY-a.sy);
    // siatka 8 px tylko gdy przycisk wskazuje aktywną siatkę
    if((qs('#grid3')?.textContent||'').includes('✓')){x=Math.round(x/8)*8;y=Math.round(y/8)*8}
  }else if(a.mode==='scale'){
    const d=Math.max(10,Math.hypot(e.clientX-a.cx,e.clientY-a.cy));
    scale=Math.max(.2,Math.min(4,a.scale*(d/a.dist)));
  }else if(a.mode==='rotate'){
    const angle=Math.atan2(e.clientY-a.cy,e.clientX-a.cx);
    rotate=a.rotate+(angle-a.angle)*180/Math.PI;
    if(e.shiftKey)rotate=Math.round(rotate/15)*15;
  }else if(a.mode==='widthR'){
    width=Math.max(40,a.width+(e.clientX-a.sx));
  }else if(a.mode==='widthL'){
    width=Math.max(40,a.width-(e.clientX-a.sx));
  }
  a.live={x,y,scale,rotate,width};
  apply(a.el,x,y,scale,rotate,width);syncFields(a.live);
}
function end(e){
  const a=active;if(!a||e.pointerId!==a.pid)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  try{a.handle.releasePointerCapture(a.pid)}catch{}
  if(a.live)syncFields(a.live);
  active=null;commit();
}

document.addEventListener('pointerdown',e=>{
  const h=e.target.closest?.('.rmove3,.rscale3,.rrot3,.rwl3,.rwr3');if(!h)return;
  const mode=h.classList.contains('rmove3')?'move':h.classList.contains('rscale3')?'scale':h.classList.contains('rrot3')?'rotate':h.classList.contains('rwl3')?'widthL':'widthR';
  begin(e,mode,h);
},true);
document.addEventListener('pointermove',move,true);
document.addEventListener('pointerup',end,true);
document.addEventListener('pointercancel',end,true);

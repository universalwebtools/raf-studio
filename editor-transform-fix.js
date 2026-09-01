const frame=document.querySelector('#siteFrame');
const q=s=>document.querySelector(s);
let boundBox=null;

function num(id,fallback=0){const el=q(id);const n=Number(el?.value);return Number.isFinite(n)?n:fallback}
function setOnly(id,value){const el=q(id);if(el)el.value=value}
function commit(id){const el=q(id);if(!el)return;el.dispatchEvent(new Event('change',{bubbles:true}))}

function selectedElement(){return frame?.contentDocument?.querySelector('.ve-selected')||null}
function liveTransform(x,y,scale,rotate){
  const el=selectedElement(); if(!el)return;
  el.style.position='relative';
  el.style.zIndex='4';
  el.style.transformOrigin='center center';
  el.style.transform=`translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
  requestAnimationFrame(syncOverlay);
}
function syncOverlay(){
  const d=frame?.contentDocument,box=d?.querySelector('.ve-transform-box'),el=selectedElement();
  if(!box||!el)return;
  const r=el.getBoundingClientRect(),w=frame.contentWindow;
  box.style.left=(r.left+w.scrollX)+'px';
  box.style.top=(r.top+w.scrollY)+'px';
  box.style.width=r.width+'px';
  box.style.height=r.height+'px';
  const lab=box.querySelector('.ve-size-label');
  if(lab)lab.textContent=Math.round(r.width)+' × '+Math.round(r.height);
}

function bindHandle(handle,mode){
  if(!handle||handle.dataset.rafFix==='2')return;
  handle.dataset.rafFix='2';
  handle.style.pointerEvents='auto';
  handle.style.touchAction='none';
  handle.addEventListener('pointerdown',e=>{
    e.preventDefault();e.stopPropagation();
    const sx=e.clientX,sy=e.clientY;
    const startX=num('#iMoveX',0),startY=num('#iMoveY',0),startScale=num('#iScale',1),startRot=num('#iRotate',0);
    const el=selectedElement(); if(!el)return;
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const startDist=Math.max(10,Math.hypot(sx-cx,sy-cy));
    const startAngle=Math.atan2(sy-cy,sx-cx);
    let x=startX,y=startY,scale=startScale,rotate=startRot;
    try{handle.setPointerCapture(e.pointerId)}catch{}

    const move=ev=>{
      ev.preventDefault();ev.stopPropagation();
      if(mode==='move'){
        x=Math.round(startX+(ev.clientX-sx));
        y=Math.round(startY+(ev.clientY-sy));
        setOnly('#iMoveX',x);setOnly('#iMoveY',y);
      }else if(mode==='scale'){
        const dist=Math.max(10,Math.hypot(ev.clientX-cx,ev.clientY-cy));
        scale=Math.max(.2,Math.min(4,startScale*(dist/startDist)));
        setOnly('#iScale',scale.toFixed(2));
      }else if(mode==='rotate'){
        const a=Math.atan2(ev.clientY-cy,ev.clientX-cx);
        rotate=startRot+(a-startAngle)*180/Math.PI;
        if(ev.shiftKey)rotate=Math.round(rotate/15)*15;
        setOnly('#iRotate',Math.round(rotate));
      }
      liveTransform(x,y,scale,rotate);
    };

    const up=ev=>{
      ev.preventDefault();ev.stopPropagation();
      try{handle.releasePointerCapture(e.pointerId)}catch{}
      handle.removeEventListener('pointermove',move);
      handle.removeEventListener('pointerup',up);
      handle.removeEventListener('pointercancel',up);
      // zapis do właściwego stanu edytora dopiero po zakończeniu gestu
      if(mode==='move'){commit('#iMoveX');commit('#iMoveY')}
      else if(mode==='scale')commit('#iScale');
      else if(mode==='rotate')commit('#iRotate');
      setTimeout(syncOverlay,0);
    };

    handle.addEventListener('pointermove',move);
    handle.addEventListener('pointerup',up);
    handle.addEventListener('pointercancel',up);
  },true);
}

function bindCurrent(){
  const d=frame?.contentDocument;if(!d)return;
  const box=d.querySelector('.ve-transform-box');
  if(!box||box===boundBox)return;
  boundBox=box;
  box.style.pointerEvents='none';
  bindHandle(box.querySelector('.ve-move-handle'),'move');
  bindHandle(box.querySelector('.ve-handle.scale'),'scale');
  bindHandle(box.querySelector('.ve-handle.rotate'),'rotate');
}
function watch(){
  const d=frame?.contentDocument;if(!d)return;
  bindCurrent();
  const mo=new MutationObserver(()=>{bindCurrent();syncOverlay()});
  mo.observe(d.body,{childList:true,subtree:true});
  d.addEventListener('scroll',syncOverlay,{passive:true});
  frame.contentWindow.addEventListener('resize',syncOverlay);
  setInterval(bindCurrent,300);
}
frame?.addEventListener('load',()=>setTimeout(watch,150));
if(frame?.contentDocument?.readyState==='complete')setTimeout(watch,250);

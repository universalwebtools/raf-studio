const frame=document.querySelector('#siteFrame');
const q=id=>document.querySelector(id);
let boundBox=null;

function setField(id,value){
  const el=q(id); if(!el)return;
  el.value=value;
  el.dispatchEvent(new Event('change',{bubbles:true}));
}
function num(id,fallback=0){const el=q(id);const n=Number(el?.value);return Number.isFinite(n)?n:fallback}

function bindHandle(handle,mode){
  if(!handle||handle.dataset.rafFix==='1')return;
  handle.dataset.rafFix='1';
  handle.style.pointerEvents='auto';
  handle.style.touchAction='none';
  handle.addEventListener('pointerdown',e=>{
    e.preventDefault();e.stopPropagation();
    try{handle.setPointerCapture(e.pointerId)}catch{}
    const sx=e.clientX, sy=e.clientY;
    const startX=num('#iMoveX',0), startY=num('#iMoveY',0), startScale=num('#iScale',1), startRot=num('#iRotate',0);
    const box=handle.closest('.ve-transform-box');
    const r=box?.getBoundingClientRect();
    const cx=(r?.left||0)+(r?.width||0)/2, cy=(r?.top||0)+(r?.height||0)/2;
    const startDist=Math.max(10,Math.hypot(sx-cx,sy-cy));
    const startAngle=Math.atan2(sy-cy,sx-cx);
    let last=null;
    const move=ev=>{
      ev.preventDefault();ev.stopPropagation();
      if(mode==='move'){
        const x=Math.round(startX+(ev.clientX-sx));
        const y=Math.round(startY+(ev.clientY-sy));
        const ex=q('#iMoveX'),ey=q('#iMoveY'); if(ex)ex.value=x;if(ey)ey.value=y;
        last=['move',x,y];
      }else if(mode==='scale'){
        const dist=Math.max(10,Math.hypot(ev.clientX-cx,ev.clientY-cy));
        const s=Math.max(.2,Math.min(4,startScale*(dist/startDist)));
        const es=q('#iScale');if(es)es.value=s.toFixed(2);last=['scale',s];
      }else if(mode==='rotate'){
        const a=Math.atan2(ev.clientY-cy,ev.clientX-cx);
        let deg=startRot+(a-startAngle)*180/Math.PI;
        if(ev.shiftKey)deg=Math.round(deg/15)*15;
        const er=q('#iRotate');if(er)er.value=Math.round(deg);last=['rotate',deg];
      }
      // live apply through the editor's existing form handlers
      if(last?.[0]==='move'){
        q('#iMoveX')?.dispatchEvent(new Event('input',{bubbles:true}));
        q('#iMoveY')?.dispatchEvent(new Event('input',{bubbles:true}));
      } else if(last?.[0]==='scale') q('#iScale')?.dispatchEvent(new Event('input',{bubbles:true}));
      else if(last?.[0]==='rotate') q('#iRotate')?.dispatchEvent(new Event('input',{bubbles:true}));
    };
    const up=ev=>{
      ev.preventDefault();ev.stopPropagation();
      try{handle.releasePointerCapture(e.pointerId)}catch{}
      handle.removeEventListener('pointermove',move);
      handle.removeEventListener('pointerup',up);
      handle.removeEventListener('pointercancel',up);
      if(last?.[0]==='move'){setField('#iMoveX',q('#iMoveX')?.value);setField('#iMoveY',q('#iMoveY')?.value)}
      else if(last?.[0]==='scale')setField('#iScale',q('#iScale')?.value);
      else if(last?.[0]==='rotate')setField('#iRotate',q('#iRotate')?.value);
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
  const mo=new MutationObserver(bindCurrent);
  mo.observe(d.body,{childList:true,subtree:true});
  setInterval(bindCurrent,400);
}
frame?.addEventListener('load',()=>setTimeout(watch,200));
if(frame?.contentDocument?.readyState==='complete')setTimeout(watch,300);

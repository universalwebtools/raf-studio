// RAF.studio — v7.1 Shift Marquee
// Shift+drag can start anywhere on the canvas (also over an element) and ADDS elements to selection.
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const TEXT='[data-home-text],#heroK,#heroT,#heroD,[data-custom62="title"],[data-custom62="text"]';
const CANDIDATES=`${TEXT},[data-raf-free],[data-raf-element]:not(.nav):not(.navlinks):not(.brand),[data-home-media],[data-raf-section],header.hero,.actions,.contactActions,.facts>.card,.offerCard54,.googleSummary54,.reviewCard54,.trustedLogo54,.raf-custom-section,[data-custom62="button"],[data-custom62="image"],[data-custom62="video"]`;
let act=null;
function blocked(e){return e.button!==0||e.target.closest('#rafTop3,#rafPanel3,#rafProModal61,.peTop,.pePanel,input,textarea,select,[contenteditable="true"],#rafV7Box,#rafTemplates71')}
function candidate(e){return e.target.closest?.('[data-raf-v7-id]')||e.target.closest?.(CANDIDATES)}
function deepestHits(l,t,r,b){const hits=$$(CANDIDATES).filter(el=>{if(el.closest('#rafTop3,#rafPanel3,#rafProModal61,.peTop,.pePanel,#rafV7Box,#rafTemplates71'))return false;const q=el.getBoundingClientRect();return q.width>0&&q.height>0&&q.right>=l&&q.left<=r&&q.bottom>=t&&q.top<=b});return hits.filter(el=>!hits.some(o=>o!==el&&el.contains(o)))}
function selected(){return window.rafV7?.selected||null}
function add(el,set){if(!el||!set)return;for(const x of [...set]){if(x!==el&&x.contains(el)){set.delete(x);x.classList.remove('rafV7Selected')}}for(const x of set)if(x!==el&&el.contains(x))return;set.add(el);el.classList.add('rafV7Selected')}
function del(el,set){if(!el||!set)return;set.delete(el);el.classList.remove('rafV7Selected')}
function refresh(){window.rafV7?.updateOverlay?.();window.rafSyncPanel64?.()}
function createBox(){let m=$('#rafV71ShiftMarquee');if(m)return m;m=document.createElement('div');m.id='rafV71ShiftMarquee';m.style.cssText='position:fixed;z-index:1000025;border:1px solid #b64cff;background:#b64cff20;pointer-events:none;box-sizing:border-box';document.body.appendChild(m);return m}
window.addEventListener('pointerdown',e=>{
 if(!e.shiftKey||blocked(e)||!selected())return;
 const target=candidate(e);act={pid:e.pointerId,sx:e.clientX,sy:e.clientY,target,moved:false,base:new Set(selected())};
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
},true);
window.addEventListener('pointermove',e=>{
 if(!act||e.pointerId!==act.pid)return;
 const dx=e.clientX-act.sx,dy=e.clientY-act.sy;if(!act.moved&&Math.hypot(dx,dy)<5)return;act.moved=true;
 const l=Math.min(act.sx,e.clientX),t=Math.min(act.sy,e.clientY),r=Math.max(act.sx,e.clientX),b=Math.max(act.sy,e.clientY),m=createBox();
 m.style.left=l+'px';m.style.top=t+'px';m.style.width=(r-l)+'px';m.style.height=(b-t)+'px';
 const set=selected();if(!set)return;
 // Shift marquee is additive: restore original selection, then add current hits.
 for(const x of [...set])if(!act.base.has(x)){set.delete(x);x.classList.remove('rafV7Selected')}
 for(const x of act.base){if(x.isConnected){set.add(x);x.classList.add('rafV7Selected')}}
 deepestHits(l,t,r,b).forEach(x=>add(x,set));
 refresh();e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
},true);
window.addEventListener('pointerup',e=>{
 if(!act||e.pointerId!==act.pid)return;const a=act;act=null;$('#rafV71ShiftMarquee')?.remove();const set=selected();
 if(set&&!a.moved&&a.target){if(set.has(a.target))del(a.target,set);else add(a.target,set)}
 refresh();
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
},true);

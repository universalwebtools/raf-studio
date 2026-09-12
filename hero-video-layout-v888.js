// RAF.studio — HERO video geometry v8.8.8
// Keeps HERO background media inside its frame. Cover never exposes the fallback image.
(function(){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let raf=0,ro=null;
  function n(v,f){const x=Number(v);return Number.isFinite(x)?x:f}
  function varNum(w,name,f){const x=parseFloat(getComputedStyle(w).getPropertyValue(name));return Number.isFinite(x)?x:f}
  function fitName(el){return el?.classList.contains('contain')?'contain':(el?.style.getPropertyValue('--vfit')||'cover')}
  function setI(el,p,v){el.style.setProperty(p,v,'important')}
  function apply(w){
    if(!(w instanceof Element)||!w.isConnected)return;
    const el=w.querySelector('.rafHeroVideo61');
    if(!el)return;
    const r=w.getBoundingClientRect();
    if(r.width<2||r.height<2)return;
    const x=clamp(varNum(w,'--vx',50),0,100),y=clamp(varNum(w,'--vy',50),0,100);
    const fit=fitName(el)==='contain'?'contain':'cover';
    let z=n(varNum(w,'--vz',1),1);z=fit==='cover'?clamp(z,1,4):clamp(z,.25,4);
    w.dataset.rafHeroFit888=fit;w.dataset.rafHeroZoom888=String(z);
    setI(w,'overflow','hidden');
    if(el instanceof HTMLVideoElement){
      setI(el,'position','absolute');setI(el,'inset','0');setI(el,'left','0');setI(el,'top','0');
      setI(el,'width','100%');setI(el,'height','100%');setI(el,'min-width','0');setI(el,'min-height','0');
      setI(el,'object-fit',fit);setI(el,'object-position',`${x}% ${y}%`);setI(el,'transform-origin',`${x}% ${y}%`);
      setI(el,'transform',z===1?'none':`scale(${z})`);return;
    }
    const ratio=16/9,ar=r.width/r.height,cover=fit==='cover';
    let bw,bh;
    if(cover){if(ar>=ratio){bw=r.width;bh=bw/ratio}else{bh=r.height;bw=bh*ratio}}
    else{if(ar>=ratio){bh=r.height;bw=bh*ratio}else{bw=r.width;bh=bw/ratio}}
    const sw=bw*z,sh=bh*z,left=(r.width-sw)*(x/100),top=(r.height-sh)*(y/100);
    setI(el,'position','absolute');setI(el,'inset','auto');setI(el,'left',`${left}px`);setI(el,'top',`${top}px`);
    setI(el,'width',`${sw}px`);setI(el,'height',`${sh}px`);setI(el,'min-width','0');setI(el,'min-height','0');
    setI(el,'max-width','none');setI(el,'max-height','none');setI(el,'transform','none');
  }
  function refresh(){raf=0;document.querySelectorAll('.rafHeroVideoWrap61').forEach(apply)}
  function schedule(){if(!raf)raf=requestAnimationFrame(refresh)}
  function observe(){
    if(!('ResizeObserver'in window))return;
    ro?.disconnect();ro=new ResizeObserver(schedule);document.querySelectorAll('.rafHeroVideoWrap61').forEach(w=>ro.observe(w));
  }
  new MutationObserver(ms=>{let hit=false;for(const m of ms){if(m.type==='childList'){for(const node of m.addedNodes){if(node.nodeType===1&&(node.matches?.('.rafHeroVideoWrap61')||node.querySelector?.('.rafHeroVideoWrap61'))){hit=true;break}}}}if(hit){observe();schedule()}}).observe(document.documentElement,{subtree:true,childList:true});
  addEventListener('resize',schedule,{passive:true});addEventListener('raf:template752-rendered',()=>{observe();schedule()});
  addEventListener('raf:hero-video-layout',schedule);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{observe();schedule()},{once:true});else{observe();schedule()}
  window.rafHeroVideoLayout888={refresh:()=>{observe();refresh()},apply};
})();

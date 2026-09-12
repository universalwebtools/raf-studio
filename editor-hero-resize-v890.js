// RAF.studio — direct HERO video resize / zoom controls v8.9.0
// Adds obvious on-canvas resize controls. Uses the existing HERO media editor controls
// as the single source of truth, so Firebase/history/public rendering stay in sync.
(function(){
  const $=(s,r=document)=>r.querySelector(s),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let ui=null,frame=null,handles=[],raf=0,pan=null,resize=null,lastSelected=false;
  function device(){const d=new URLSearchParams(location.search).get('device');return d==='mobile'?'mobile':d==='tablet'?'tablet':'desktop'}
  function keys(){return device()==='mobile'?{x:'mobileX',y:'mobileY',z:'mobileZoom',fit:'mobileFit'}:{x:'x',y:'y',z:'zoom',fit:'fit'}}
  function editor(){return window.rafHeroMediaEditor888}
  function cfg(){try{return editor()?.getConfig?.()||{}}catch{return{}}}
  function hero(){return $('#rafTemplate752 [data-raf-section="Hero"]')||$('[data-raf-section="Hero"]')||$('header.hero')}
  function wrap(){return hero()?.querySelector('.rafHeroVideoWrap61[data-raf-hero-video="active"],.rafHeroVideoWrap61')||null}
  function media(){return wrap()?.querySelector('.rafHeroVideo61')||null}
  function active(){const c=cfg();return !!(editor()&&c?.enabled&&c?.url&&hero()&&wrap())}
  function isSelected(){try{return !!editor()?.isSelected?.()}catch{return false}}
  function ensureSelected(){if(!active())return false;try{editor().select?.();return true}catch{return false}}
  function control(id){return document.getElementById(id)}
  function current(){const c=cfg(),k=keys(),fit=(c[k.fit]||c.fit||'cover')==='contain'?'contain':'cover';let z=Number(c[k.z]);if(!Number.isFinite(z))z=1;return{x:clamp(Number(c[k.x]??50),0,100),y:clamp(Number(c[k.y]??50),0,100),z:clamp(z,.25,4),fit}}
  function trigger(el,type='input'){if(!el)return;el.dispatchEvent(new Event(type,{bubbles:true}))}
  function ensurePanel(){ensureSelected();return !!control('rafHeroZoom888')}
  function setFit(fit){if(!ensurePanel())return;const b=control(fit==='contain'?'rafHeroContain888':'rafHeroCover888');b?.click();setTimeout(()=>{sync();position()},0)}
  function setZoom(z,commit=false){z=clamp(Number(z)||1,.25,4);if(!ensurePanel())return;
    let v=current();if(z<1&&v.fit!=='contain'){control('rafHeroContain888')?.click();}
    requestAnimationFrame(()=>{const s=control('rafHeroZoom888');if(!s)return;s.min='.25';s.value=String(z);trigger(s,'input');if(commit)trigger(s,'change');sync();position()});
  }
  function setXY(x,y,commit=false){if(!ensurePanel())return;const sx=control('rafHeroX888'),sy=control('rafHeroY888');if(sx){sx.value=String(clamp(x,0,100));trigger(sx,'input');if(commit)trigger(sx,'change')}if(sy){sy.value=String(clamp(y,0,100));trigger(sy,'input');if(commit)trigger(sy,'change')}sync();position()}
  function nudge(dir){const v=current(),step=.1;setZoom(v.z+(dir>0?step:-step),true)}
  function css(){if($('#rafHeroResize890Css'))return;const s=document.createElement('style');s.id='rafHeroResize890Css';s.textContent=`
#rafHeroResizeFrame890{position:fixed;z-index:1000016;pointer-events:none;border:2px solid #21b5ff;box-shadow:inset 0 0 0 1px #ffffff55;display:none;box-sizing:border-box}
.rafHeroResizeHandle890{position:fixed;z-index:1000020;width:16px;height:16px;margin:-8px 0 0 -8px;border:2px solid #21b5ff;border-radius:50%;background:#fff;box-shadow:0 3px 14px #000a;cursor:nwse-resize;display:none;box-sizing:border-box;pointer-events:auto}.rafHeroResizeHandle890[data-corner="tr"],.rafHeroResizeHandle890[data-corner="bl"]{cursor:nesw-resize}
#rafHeroToolbar890{position:fixed;z-index:1000021;display:none;align-items:center;gap:5px;padding:6px;border:1px solid #41c2ff88;border-radius:10px;background:#0a0c10ef;box-shadow:0 10px 32px #000b;backdrop-filter:blur(10px);font:800 10px system-ui;color:#fff;pointer-events:auto}
#rafHeroToolbar890 button{border:1px solid #ffffff25;background:#171a20;color:#fff;border-radius:7px;padding:7px 9px;cursor:pointer;font:800 10px system-ui}#rafHeroToolbar890 button:hover{background:#252a31}#rafHeroToolbar890 button.active{background:#087aa9;border-color:#58d0ff}#rafHeroToolbar890 .zoom{min-width:52px;text-align:center;color:#7fd8ff;font-weight:900}#rafHeroToolbar890 .hint{color:#87939f;font-weight:700;padding:0 3px;white-space:nowrap}
body.rafCleanCanvas889 #rafHeroToolbar890,body.rafCleanCanvas889 .rafHeroResizeHandle890,body.rafCleanCanvas889 #rafHeroResizeFrame890{display:none!important}
.rafHeroVideoWrap61[data-raf-hero-video="active"]{background:#000!important}
`;
    document.head.appendChild(s)}
  function ensureUI(){css();if(!frame){frame=document.createElement('div');frame.id='rafHeroResizeFrame890';document.body.appendChild(frame)}if(!ui){ui=document.createElement('div');ui.id='rafHeroToolbar890';ui.innerHTML='<span class="hint">🎬 WIDEO</span><button data-act="minus">−</button><span class="zoom">100%</span><button data-act="plus">+</button><button data-act="contain">CAŁY</button><button data-act="cover">WYPEŁNIJ</button><button data-act="center">● ŚRODEK</button>';document.body.appendChild(ui);ui.addEventListener('pointerdown',e=>e.stopPropagation());ui.onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.act;if(a==='minus')nudge(-1);if(a==='plus')nudge(1);if(a==='contain')setFit('contain');if(a==='cover')setFit('cover');if(a==='center')control('rafHeroCenter888')?.click()}}
    if(!handles.length){for(const corner of ['tl','tr','br','bl']){const h=document.createElement('div');h.className='rafHeroResizeHandle890';h.dataset.corner=corner;document.body.appendChild(h);h.addEventListener('pointerdown',startResize,true);handles.push(h)}}
  }
  function show(on){ensureUI();frame.style.display=on?'block':'none';ui.style.display=on?'flex':'none';handles.forEach(h=>h.style.display=on?'block':'none')}
  function position(){raf=0;ensureUI();if(!active()||!isSelected()){show(false);return}const h=hero(),r=h?.getBoundingClientRect();if(!r||r.width<2||r.height<2){show(false);return}show(true);frame.style.left=r.left+'px';frame.style.top=r.top+'px';frame.style.width=r.width+'px';frame.style.height=r.height+'px';const pts={tl:[r.left,r.top],tr:[r.right,r.top],br:[r.right,r.bottom],bl:[r.left,r.bottom]};for(const x of handles){const p=pts[x.dataset.corner];x.style.left=p[0]+'px';x.style.top=p[1]+'px'}const tw=ui.offsetWidth||420,th=ui.offsetHeight||40;let left=clamp(r.left+12,8,innerWidth-tw-8),top=r.top+12;if(top<8)top=r.bottom-th-12;if(top+th>innerHeight-8)top=8;ui.style.left=left+'px';ui.style.top=top+'px';sync()}
  function schedule(){if(!raf)raf=requestAnimationFrame(position)}
  function sync(){if(!ui)return;const v=current();const z=ui.querySelector('.zoom');if(z)z.textContent=Math.round(v.z*100)+'%';ui.querySelector('[data-act="contain"]')?.classList.toggle('active',v.fit==='contain');ui.querySelector('[data-act="cover"]')?.classList.toggle('active',v.fit==='cover')}
  function startResize(e){if(e.button!==0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();ensureSelected();const v=current(),r=hero()?.getBoundingClientRect();if(!r)return;resize={id:e.pointerId,corner:e.currentTarget.dataset.corner,cx:e.clientX,cy:e.clientY,z:v.z,r};try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}}
  function moveResize(e){if(!resize||resize.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();const c=resize.corner,sx=c.includes('r')?1:-1,sy=c.includes('b')?1:-1,dx=(e.clientX-resize.cx)*sx,dy=(e.clientY-resize.cy)*sy,diag=Math.max(220,Math.hypot(resize.r.width,resize.r.height)*.55),z=resize.z+(dx+dy)/diag;setZoom(z,false)}
  function endResize(e){if(!resize||resize.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();resize=null;const s=control('rafHeroZoom888');if(s)trigger(s,'change');sync();schedule()}
  addEventListener('pointermove',moveResize,true);addEventListener('pointerup',endResize,true);addEventListener('pointercancel',endResize,true);

  // Fallback direct selection/pan: if the generic element editor tries to grab the video itself,
  // switch to the dedicated HERO background editor instead.
  addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest?.('#rafHeroToolbar890,.rafHeroResizeHandle890,#rafTop3,#rafPanel3,#rafDockLauncher889,#rafDockMenu889'))return;const w=e.target.closest?.('.rafHeroVideoWrap61,.rafHeroVideo61');if(!w||!active())return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();ensureSelected();const v=current();pan={id:e.pointerId,cx:e.clientX,cy:e.clientY,x:v.x,y:v.y,moved:false};schedule()},true);
  addEventListener('pointermove',e=>{if(!pan||pan.id!==e.pointerId||resize)return;const r=hero()?.getBoundingClientRect();if(!r)return;const dx=e.clientX-pan.cx,dy=e.clientY-pan.cy;if(!pan.moved&&Math.hypot(dx,dy)<3)return;pan.moved=true;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setXY(pan.x-dx/Math.max(1,r.width)*100,pan.y-dy/Math.max(1,r.height)*100,false)},true);
  addEventListener('pointerup',e=>{if(!pan||pan.id!==e.pointerId)return;const moved=pan.moved;pan=null;if(moved){const sx=control('rafHeroX888'),sy=control('rafHeroY888');if(sx)trigger(sx,'change');if(sy)trigger(sy,'change')}schedule()},true);

  addEventListener('raf:v760-selection',()=>setTimeout(()=>{try{const a=(window.rafCore760||window.rafCore72)?.selected?.()||[];if(a.some(el=>el?.matches?.('.rafHeroVideoWrap61,.rafHeroVideo61')||el?.closest?.('.rafHeroVideoWrap61'))){(window.rafCore760||window.rafCore72)?.clear?.();ensureSelected()}}catch{}schedule()},0));
  for(const ev of ['raf:template752-rendered','raf:universal-elements-ready','raf:history-pro'])addEventListener(ev,()=>setTimeout(schedule,80));
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  const watch=setInterval(()=>{const s=isSelected();if(s!==lastSelected){lastSelected=s;schedule()}if(s)schedule()},220);
  setTimeout(schedule,500);
  window.rafHeroResize890={zoom:setZoom,fit:setFit,select:()=>{ensureSelected();schedule()},refresh:schedule};
})();

// RAF.studio — video performance governor v8.8.8
// Editor: pause media without unloading it, so the frame stays stable and GPU usage stays low.
(function(){
 const Q=new URLSearchParams(location.search),EDITOR=Q.has('editor'),TPL_PREVIEW=Q.has('tplPreview');
 const videos=new Set(),frames=new Set();let io=null,frameIo=null,raf=0;
 const inPreview=()=>TPL_PREVIEW||document.body?.classList.contains('raf-preview631')||document.body?.classList.contains('raf-preview632')||document.body?.classList.contains('raf-preview64');
 const visible=el=>{const r=el.getBoundingClientRect();return r.bottom>-180&&r.top<innerHeight+180&&r.right>0&&r.left<innerWidth};
 const isFrame=f=>/(youtube(?:-nocookie)?\.com|youtu\.be|player\.vimeo\.com)/i.test(f.src||f.dataset.rafFrameSrc888||'');
 function markVideo(v){if(!(v instanceof HTMLVideoElement))return;if(v.autoplay||v.hasAttribute('autoplay'))v.dataset.rafAuto888='1';videos.add(v)}
 function pauseVideo(v){markVideo(v);if(v.dataset.rafAuto888!=='1')return;try{v.pause()}catch{}v.autoplay=false;v.removeAttribute('autoplay');v.preload='metadata';v.dataset.rafEditorSuspended888='1'}
 function resumeVideo(v,play){markVideo(v);if(v.dataset.rafEditorSuspended888==='1'){delete v.dataset.rafEditorSuspended888;if(v.dataset.rafAuto888==='1'){v.autoplay=true;v.setAttribute('autoplay','')}}if(play&&v.dataset.rafAuto888==='1'&&document.visibilityState==='visible'&&visible(v))v.play().catch(()=>{})}
 function markFrame(f){if(!(f instanceof HTMLIFrameElement)||!isFrame(f))return;frames.add(f);f.loading='lazy';const src=f.getAttribute('src')||'';if(!f.dataset.rafFrameSrc888&&/(?:\?|&)autoplay=1(?:&|$)/.test(src))f.dataset.rafFrameSrc888=src}
 function pauseFrame(f){markFrame(f);const original=f.dataset.rafFrameSrc888;if(!original)return;try{const u=new URL(original,location.href);u.searchParams.set('autoplay','0');const safe=u.toString();if(f.getAttribute('src')!==safe)f.setAttribute('src',safe)}catch{}f.dataset.rafEditorSuspended888='1'}
 function resumeFrame(f){markFrame(f);const src=f.dataset.rafFrameSrc888;if(f.dataset.rafEditorSuspended888==='1'&&src&&visible(f)){if(f.getAttribute('src')!==src)f.setAttribute('src',src);delete f.dataset.rafEditorSuspended888}}
 function prepare(root=document){
  const vs=root instanceof HTMLVideoElement?[root]:[...root.querySelectorAll?.('video')||[]],fs=root instanceof HTMLIFrameElement?[root]:[...root.querySelectorAll?.('iframe')||[]],edit=EDITOR&&!inPreview();
  for(const v of vs){markVideo(v);if(edit)pauseVideo(v);else{resumeVideo(v,false);if(io&&v.dataset.rafAuto888==='1')io.observe(v)}}
  for(const f of fs){markFrame(f);if(edit)pauseFrame(f);else{if(frameIo&&f.dataset.rafFrameSrc888)frameIo.observe(f);if(inPreview())resumeFrame(f)}}
  window.rafHeroVideoLayout888?.refresh?.();
 }
 function sync(){raf=0;const edit=EDITOR&&!inPreview();for(const v of [...videos]){if(!v.isConnected){videos.delete(v);continue}if(edit)pauseVideo(v);else if(document.visibilityState!=='visible'||!visible(v))try{v.pause()}catch{}else resumeVideo(v,true)}for(const f of [...frames]){if(!f.isConnected){frames.delete(f);continue}if(edit)pauseFrame(f);else if(inPreview())resumeFrame(f)}window.rafHeroVideoLayout888?.refresh?.()}
 function schedule(){if(!raf)raf=requestAnimationFrame(sync)}
 if('IntersectionObserver'in window){io=new IntersectionObserver(es=>{if(EDITOR&&!inPreview())return;for(const e of es){const v=e.target;if(e.isIntersecting&&document.visibilityState==='visible')resumeVideo(v,true);else try{v.pause()}catch{}}},{rootMargin:'220px 0px',threshold:.01});frameIo=new IntersectionObserver(es=>{if(EDITOR&&!inPreview())return;for(const e of es)if(e.isIntersecting&&inPreview())resumeFrame(e.target)},{rootMargin:'220px 0px',threshold:.01})}
 document.addEventListener('play',e=>{const v=e.target;if(!(v instanceof HTMLVideoElement))return;markVideo(v);if(EDITOR&&!inPreview())queueMicrotask(()=>pauseVideo(v))},true);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')for(const v of videos)try{v.pause()}catch{}else schedule()});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 new MutationObserver(ms=>{for(const m of ms)if(m.type==='childList')for(const n of m.addedNodes)if(n.nodeType===1)prepare(n);schedule()}).observe(document.documentElement,{subtree:true,childList:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{prepare();schedule()},{once:true});else{prepare();schedule()}
 setInterval(()=>{if(EDITOR&&!inPreview())sync()},1800);
 window.rafVideoPerformance888={refresh:()=>{prepare();sync()},stats:()=>({videos:[...videos].filter(x=>x.isConnected).length,playing:[...videos].filter(x=>x.isConnected&&!x.paused).length,editorSuspended:[...videos].filter(x=>x.dataset.rafEditorSuspended888==='1').length,frames:[...frames].filter(x=>x.isConnected).length})};
 window.rafVideoPerformance884=window.rafVideoPerformance888;
})();

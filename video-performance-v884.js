// RAF.studio — video performance governor v8.8.4
// Keeps the visual editor responsive by suspending autoplay decoders while editing.
// On the public site native autoplay videos are paused when off-screen / tab is hidden.
(function(){
 const Q=new URLSearchParams(location.search),EDITOR=Q.has('editor'),TPL_PREVIEW=Q.has('tplPreview');
 const tracked=new Set(),trackedFrames=new Set();
 let io=null,frameIo=null,raf=0;
 const inPreview=()=>TPL_PREVIEW||document.body?.classList.contains('raf-preview631')||document.body?.classList.contains('raf-preview632')||document.body?.classList.contains('raf-preview64');
 const visible=el=>{const r=el.getBoundingClientRect();return r.bottom>-180&&r.top<innerHeight+180&&r.right>0&&r.left<innerWidth};
 const isAutoVideo=v=>v.dataset.rafAuto884==='1'||v.autoplay||v.hasAttribute('autoplay');
 const isVideoFrame=f=>/(youtube(?:-nocookie)?\.com|youtu\.be|player\.vimeo\.com)/i.test(f.src||f.dataset.rafFrameSrc884||'');
 function heroFallbackOff(el){
  const media=el.closest?.('.heroMedia');if(!media)return;
  if(media.classList.contains('raf-video-active61')){media.dataset.rafVideoActive884='1';media.classList.remove('raf-video-active61')}
 }
 function heroFallbackOn(el){
  const media=el.closest?.('.heroMedia');if(media?.dataset.rafVideoActive884==='1'){media.classList.add('raf-video-active61');delete media.dataset.rafVideoActive884}
 }
 function markVideo(v){
  if(!(v instanceof HTMLVideoElement))return;
  if(v.autoplay||v.hasAttribute('autoplay'))v.dataset.rafAuto884='1';
  tracked.add(v);
 }
 function suspendVideo(v){
  markVideo(v);if(!isAutoVideo(v))return;
  try{v.pause()}catch{}
  if(!v.dataset.rafSrc884&&v.getAttribute('src'))v.dataset.rafSrc884=v.getAttribute('src');
  if(v.getAttribute('src')){v.removeAttribute('src');try{v.load()}catch{}}
  v.autoplay=false;v.removeAttribute('autoplay');v.preload='metadata';v.dataset.rafEditorSuspended884='1';heroFallbackOff(v);
 }
 function resumeVideo(v,allowPlay=true){
  markVideo(v);
  if(v.dataset.rafEditorSuspended884==='1'){
   const src=v.dataset.rafSrc884;if(src&&!v.getAttribute('src')){v.setAttribute('src',src);try{v.load()}catch{}}
   delete v.dataset.rafEditorSuspended884;heroFallbackOn(v);
  }
  if(v.dataset.rafAuto884==='1'&&allowPlay&&document.visibilityState==='visible'&&visible(v))v.play().catch(()=>{});
 }
 function markFrame(f){
  if(!(f instanceof HTMLIFrameElement)||!isVideoFrame(f))return;
  trackedFrames.add(f);f.loading='lazy';
  const src=f.getAttribute('src')||'';
  if(/(?:\?|&)autoplay=1(?:&|$)/.test(src)&&!f.dataset.rafFrameSrc884)f.dataset.rafFrameSrc884=src;
 }
 function suspendFrame(f){
  markFrame(f);const original=f.dataset.rafFrameSrc884;if(!original)return;
  try{const u=new URL(original,location.href);u.searchParams.set('autoplay','0');const safe=u.toString();if(f.src!==safe)f.src=safe}catch{}
  f.dataset.rafEditorSuspended884='1';heroFallbackOff(f);
 }
 function resumeFrame(f){
  markFrame(f);if(f.dataset.rafEditorSuspended884==='1'&&f.dataset.rafFrameSrc884&&visible(f)){if(f.src!==f.dataset.rafFrameSrc884)f.src=f.dataset.rafFrameSrc884;delete f.dataset.rafEditorSuspended884;heroFallbackOn(f)}
 }
 function prepare(root=document){
  const videos=root instanceof HTMLVideoElement?[root]:[...root.querySelectorAll?.('video')||[]];
  const frames=root instanceof HTMLIFrameElement?[root]:[...root.querySelectorAll?.('iframe')||[]];
  const edit=EDITOR&&!inPreview();
  for(const v of videos){markVideo(v);if(edit)suspendVideo(v);else{resumeVideo(v,false);if(io&&isAutoVideo(v))io.observe(v)}}
  for(const f of frames){markFrame(f);if(edit)suspendFrame(f);else{if(frameIo&&f.dataset.rafFrameSrc884)frameIo.observe(f);if(inPreview())resumeFrame(f)}}
 }
 function sync(){
  raf=0;const edit=EDITOR&&!inPreview();
  for(const v of [...tracked]){if(!v.isConnected){tracked.delete(v);continue}if(edit)suspendVideo(v);else{resumeVideo(v,false);if(isAutoVideo(v)){if(document.visibilityState!=='visible'||!visible(v))v.pause();else v.play().catch(()=>{})}}}
  for(const f of [...trackedFrames]){if(!f.isConnected){trackedFrames.delete(f);continue}if(edit)suspendFrame(f);else if(inPreview())resumeFrame(f)}
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(sync)}
 if('IntersectionObserver'in window){
  io=new IntersectionObserver(entries=>{if(EDITOR&&!inPreview())return;for(const e of entries){const v=e.target;if(!isAutoVideo(v))continue;if(e.isIntersecting&&document.visibilityState==='visible')resumeVideo(v,true);else try{v.pause()}catch{}}},{rootMargin:'220px 0px',threshold:.01});
  frameIo=new IntersectionObserver(entries=>{if(EDITOR&&!inPreview())return;for(const e of entries){const f=e.target;if(!isVideoFrame(f))continue;if(e.isIntersecting&&inPreview())resumeFrame(f)}},{rootMargin:'220px 0px',threshold:.01});
 }
 document.addEventListener('play',e=>{const v=e.target;if(!(v instanceof HTMLVideoElement))return;markVideo(v);if(EDITOR&&!inPreview()){queueMicrotask(()=>suspendVideo(v));return}if(!visible(v)||document.visibilityState!=='visible')queueMicrotask(()=>{try{v.pause()}catch{}})},true);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'){for(const v of tracked)try{v.pause()}catch{}}else schedule()});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 new MutationObserver(ms=>{for(const m of ms){if(m.type==='childList')for(const n of m.addedNodes)if(n.nodeType===1)prepare(n);if(m.type==='attributes'&&m.target===document.body)schedule()}schedule()}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{prepare();schedule()},{once:true});else{prepare();schedule()}
 setInterval(()=>{if(EDITOR&&!inPreview())sync()},1200);
 window.rafVideoPerformance884={refresh:()=>{prepare();sync()},stats:()=>({videos:[...tracked].filter(x=>x.isConnected).length,playing:[...tracked].filter(x=>x.isConnected&&!x.paused).length,editorSuspended:[...tracked].filter(x=>x.dataset.rafEditorSuspended884==='1').length,frames:[...trackedFrames].filter(x=>x.isConnected).length})};
})();

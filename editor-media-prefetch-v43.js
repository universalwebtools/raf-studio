// RAF.studio — prefetch mediów edytora v4.3
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig, WEBSITE_ROOT } from "./firebase-config.js";
const app=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(app);
const keys=['heroMedia','photoPortal','filmPortal','aboutPortrait'];
const dev=()=>new URLSearchParams(location.search).get('device')||(innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop');
function cfgFor(cfg={},d=dev()){const desk=cfg.desktop||{};return d==='desktop'?{x:50,y:50,zoom:1,brightness:100,contrast:100,opacity:100,radius:0,...desk}:{x:50,y:50,zoom:1,brightness:100,contrast:100,opacity:100,radius:0,...desk,...(cfg[d]||{})}}
function preload(src){return new Promise(resolve=>{if(!src)return resolve(false);const i=new Image();i.onload=()=>resolve(true);i.onerror=()=>resolve(false);i.src=src})}
for(const k of keys){const el=document.querySelector(`[data-home-media="${k}"]`);if(el)el.style.opacity='0'}
try{
 const s=await get(ref(db,`${WEBSITE_ROOT}/public/editorDraft/homeMedia`));
 const media=s.val()||{};
 await Promise.all(keys.map(async k=>{const el=document.querySelector(`[data-home-media="${k}"]`);const m=media[k]||{};const src=m.url||'';if(!el||!src)return;const ok=await preload(src);if(!ok)return;const c=cfgFor(m);el.src=src;el.dataset.loadedSrc=src;el.style.objectPosition=`${c.x}% ${c.y}%`;el.style.transformOrigin=`${c.x}% ${c.y}%`;el.style.transform=`scale(${Math.max(1,Number(c.zoom)||1)})`;el.style.objectFit='cover';el.style.width='100%';el.style.height='100%';el.style.filter=`brightness(${Number(c.brightness)||100}%) contrast(${Number(c.contrast)||100}%)`;el.style.borderRadius=`${Number(c.radius)||0}px`;el.style.opacity=String((Number(c.opacity)||100)/100)}));
}catch(e){console.warn('RAF editor media prefetch',e)}

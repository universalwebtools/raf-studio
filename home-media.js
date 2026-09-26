import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig, WEBSITE_ROOT } from "./firebase-config.js";

const app=initializeApp(firebaseConfig),db=getDatabase(app);
const MEDIA_QUERY=new URLSearchParams(location.search),EDITOR_MODE=MEDIA_QUERY.has('editor')||MEDIA_QUERY.has('tplPreview');
const defaults={heroMedia:{url:'assets/portal-film.png',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}},photoPortal:{url:'assets/portal-photo.png',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}},filmPortal:{url:'assets/portal-film.png',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}},aboutPortrait:{url:'assets/about-portrait.jpg',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}}};
let current={};
const dev=()=>innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop';
function cfgFor(cfg,d){const desk=cfg.desktop||{};return d==='desktop'?{x:50,y:50,zoom:1,brightness:100,contrast:100,opacity:100,radius:0,...desk}:{x:50,y:50,zoom:1,brightness:100,contrast:100,opacity:100,radius:0,...(cfg[`inherit${d[0].toUpperCase()+d.slice(1)}`]===false?{}:desk),...(cfg[d]||{})}}
function applyVisual(img,d,visible=true){img.style.objectPosition=`${d.x}% ${d.y}%`;img.style.transformOrigin=`${d.x}% ${d.y}%`;img.style.transform=`scale(${Math.max(1,Number(d.zoom)||1)})`;img.style.width='100%';img.style.height='100%';img.style.objectFit='cover';img.style.filter=`brightness(${Number(d.brightness)||100}%) contrast(${Number(d.contrast)||100}%)`;img.style.borderRadius=`${Number(d.radius)||0}px`;if(visible)img.style.opacity=String((Number(d.opacity)||100)/100)}
function apply(key,cfg){const imgs=[...document.querySelectorAll(`[data-home-media="${key}"]`)];if(!imgs.length)return;const d=cfgFor(cfg,dev()),src=cfg.url||defaults[key].url;for(const img of imgs){applyVisual(img,d,false);
  if(img.dataset.loadedSrc===src&&img.complete){img.style.opacity=String((Number(d.opacity)||100)/100);continue}
  img.style.opacity='0';const pre=new Image();
  pre.onload=()=>{img.src=src;img.dataset.loadedSrc=src;requestAnimationFrame(()=>{applyVisual(img,d,true)})};
  pre.onerror=()=>{console.warn('RAF.studio: nie udało się wczytać obrazu',key,src);img.style.opacity='0'};pre.src=src}
}
function render(raw={}){current=raw;for(const key of Object.keys(defaults))apply(key,{...defaults[key],...(raw[key]||{})})}
if(!EDITOR_MODE)onValue(ref(db,`${WEBSITE_ROOT}/public/homeMedia`),s=>render(s.val()||{}));
addEventListener('resize',()=>{if(!EDITOR_MODE)render(current)});
addEventListener('raf:template752-rendered',()=>{if(!EDITOR_MODE)requestAnimationFrame(()=>render(current))});

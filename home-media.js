import {mediaConfig,applyMediaAppearance} from './media-appearance-v893.js?v=893-parity-1';
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig, WEBSITE_ROOT } from "./firebase-config.js";

const app=initializeApp(firebaseConfig),db=getDatabase(app);
const MEDIA_QUERY=new URLSearchParams(location.search),EDITOR_MODE=MEDIA_QUERY.has('editor')||MEDIA_QUERY.has('tplPreview');
const defaults={heroMedia:{url:'assets/portal-film.png',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}},photoPortal:{url:'assets/portal-photo.png',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}},filmPortal:{url:'assets/portal-film.png',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}},aboutPortrait:{url:'assets/about-portrait.jpg',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}}};
let current={};const pending=new WeakMap();
const dev=()=>innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop';
const cfgFor=mediaConfig;
function applyVisual(img,d,visible=true){if(img.dataset.rafFrameManaged!=='1'){img.style.width='100%';img.style.height='100%'}applyMediaAppearance(img,d,visible)}
function apply(key,cfg){const imgs=[...document.querySelectorAll(`[data-home-media="${key}"]`)];if(!imgs.length)return;const d=cfgFor(cfg,dev()),src=cfg.url||defaults[key].url;for(const img of imgs){const request={};pending.set(img,request);applyVisual(img,d,false);
  if(img.getAttribute('src')===src||(img.dataset.loadedSrc===src&&img.complete)){img.dataset.loadedSrc=src;applyVisual(img,d,true);continue}
  img.style.opacity='0';const pre=new Image();
  pre.onload=()=>{if(pending.get(img)!==request||!img.isConnected)return;img.src=src;img.dataset.loadedSrc=src;requestAnimationFrame(()=>{applyVisual(img,d,true)})};
  pre.onerror=()=>{if(pending.get(img)!==request||!img.isConnected)return;console.warn('RAF.studio: nie udało się wczytać obrazu',key,src);img.style.opacity='0'};pre.src=src}
}
function render(raw={}){current=raw;for(const key of Object.keys(defaults))apply(key,{...defaults[key],...(raw[key]||{})})}
if(!EDITOR_MODE)onValue(ref(db,`${WEBSITE_ROOT}/public/homeMedia`),s=>render(s.val()||{}));
addEventListener('resize',()=>{if(!EDITOR_MODE)render(current)});
addEventListener('raf:template752-rendered',()=>{if(!EDITOR_MODE)requestAnimationFrame(()=>render(current))});

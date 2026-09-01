import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig, WEBSITE_ROOT } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const EDITOR_MODE=new URLSearchParams(location.search).get('editor')==='1';
const defaults = {
  heroMedia:{url:'assets/portal-film.png',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}},
  photoPortal:{url:'assets/portal-photo.png',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}},
  filmPortal:{url:'assets/portal-film.png',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}},
  aboutPortrait:{url:'assets/about-portrait.jpg',desktop:{x:50,y:50,zoom:1},tablet:{x:50,y:50,zoom:1},mobile:{x:50,y:50,zoom:1}}
};
let current={};
function dev(){return innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop'}
function apply(key,cfg){
  const img=document.querySelector(`[data-home-media="${key}"]`);if(!img)return;
  const d={x:50,y:50,zoom:1,...(cfg[dev()]||{})};
  const src=cfg.url||defaults[key].url;
  img.style.objectPosition=`${d.x}% ${d.y}%`;
  img.style.transformOrigin=`${d.x}% ${d.y}%`;
  img.style.transform=`scale(${Math.max(1,Number(d.zoom)||1)})`;
  img.style.width='100%';img.style.height='100%';img.style.objectFit='cover';
  if(img.dataset.loadedSrc===src){img.style.opacity='1';return;}
  img.style.opacity='0';
  const pre=new Image();
  pre.onload=()=>{img.src=src;img.dataset.loadedSrc=src;requestAnimationFrame(()=>{img.style.opacity='1'})};
  pre.onerror=()=>{if(key!=='heroMedia'){img.src=defaults[key].url;img.style.opacity='1'}};
  pre.src=src;
}
function render(raw={}){current=raw;for(const key of Object.keys(defaults))apply(key,{...defaults[key],...(raw[key]||{})});}
if(!EDITOR_MODE)onValue(ref(db,`${WEBSITE_ROOT}/public/homeMedia`),snap=>render(snap.val()||{}));
window.addEventListener('resize',()=>{if(!EDITOR_MODE)render(current)});

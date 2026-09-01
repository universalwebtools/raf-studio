import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig, WEBSITE_ROOT } from "./firebase-config.js";

const EDITOR_MODE=new URLSearchParams(location.search).has('editor');
const app=initializeApp(firebaseConfig),db=getDatabase(app);
const dev=()=>innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop';
let current={};

function applyElementStyle(el,c={}){
  if(!el)return;
  el.style.background=c.background||'';
  el.style.color=c.color||'';
  el.style.borderColor=c.borderColor||'';
  el.style.borderRadius=c.radius!=null?`${c.radius}px`:'';
  el.style.paddingLeft=c.paddingX!=null?`${c.paddingX}px`:'';
  el.style.paddingRight=c.paddingX!=null?`${c.paddingX}px`:'';
  el.style.paddingTop=c.paddingY!=null?`${c.paddingY}px`:'';
  el.style.paddingBottom=c.paddingY!=null?`${c.paddingY}px`:'';
  el.style.fontSize=c.fontSize!=null?`${c.fontSize}px`:'';
  el.style.opacity=c.opacity!=null?String(c.opacity):'';
  el.style.zIndex=c.zIndex!=null?String(c.zIndex):'';
  if(c.display==='none')el.style.display='none';else if(el.dataset.rafRuntimeHidden==='1'){el.style.display='';delete el.dataset.rafRuntimeHidden}
  if(c.display==='none')el.dataset.rafRuntimeHidden='1';
  el.style.setProperty('--raf-anim-duration',`${c.animationDuration||700}ms`);
  el.dataset.rafAnimation=c.animation||'';
}
function applyElements(builder){
  const d=dev();
  for(const [key,byDev] of Object.entries(builder.elements||{})){
    const el=document.querySelector(`[data-raf-element="${CSS.escape(key)}"]`);if(!el)continue;
    const c={...(byDev.desktop||{}),...(byDev[d]||{})};
    if(c.text!=null)el.textContent=c.text;
    if(c.href!=null&&'href'in el)el.href=c.href;
    applyElementStyle(el,c);
  }
}
function sectionNode(key){return key==='Hero'?document.querySelector('header.hero'):document.querySelector(`[data-raf-section="${CSS.escape(key)}"]`)}
function renderCustomSection(s){
  const sec=document.createElement('section');sec.className='section raf-custom-section';sec.dataset.rafSection=s.id;sec.dataset.customSection='1';
  const img=s.imageUrl?`<div class="portrait"><img src="${s.imageUrl}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>`:'';
  const btn=s.buttonText?`<a class="btn primary" href="${s.buttonUrl||'#'}">${s.buttonText}</a>`:'';
  if(s.type==='gallery'){
    const imgs=(s.images||[]).map(u=>`<img src="${u}" loading="lazy" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:18px">`).join('');
    sec.innerHTML=`<div class="wrap"><div class="sectionHead"><h2>${s.title||'GALERIA.'}</h2><p>${s.text||''}</p></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">${imgs}</div></div>`;
  }else if(s.type==='video'){
    sec.innerHTML=`<div class="wrap"><div class="sectionHead"><h2>${s.title||'VIDEO.'}</h2><p>${s.text||''}</p></div>${s.videoUrl?`<video src="${s.videoUrl}" controls style="width:100%;border-radius:18px"></video>`:''}</div>`;
  }else if(s.type==='cta'){
    sec.innerHTML=`<div class="wrap contactBox"><div><h2>${s.title||'DZIAŁAMY?'}</h2><p>${s.text||''}</p></div><div>${btn}</div></div>`;
  }else{
    sec.innerHTML=`<div class="wrap about">${img}<div><h2>${s.title||'NOWA SEKCJA.'}</h2><p>${s.text||''}</p>${btn}</div></div>`;
  }
  if(s.hidden)sec.style.display='none';
  return sec;
}
function applySections(builder){
  document.querySelectorAll('.raf-custom-section').forEach(x=>x.remove());
  const main=document.querySelector('#rafMain')||document.querySelector('main');if(!main)return;
  const customMap={};for(const s of builder.customSections||[]){const node=renderCustomSection(s);customMap[s.id]=node;main.appendChild(node)}
  const order=builder.sectionOrder||['Hero','TwoWorlds','About','Reviews','Brands','Contact'];
  const hero=document.querySelector('header.hero');
  for(const key of order){const n=sectionNode(key)||customMap[key];if(!n)continue;if(key==='Hero'){/* hero stays before main */continue}main.appendChild(n)}
  // Any custom section not in order remains before contact at the end.
  for(const s of builder.customSections||[]){if(!order.includes(s.id)&&customMap[s.id])main.appendChild(customMap[s.id])}
  if(hero&&order.indexOf('Hero')>0){/* Hero cannot live inside main safely; visual order is handled via CSS order only in editor. */}
}
function applyAnimations(){
  document.querySelectorAll('[data-raf-animation]').forEach(el=>{
    const a=el.dataset.rafAnimation;if(!a)return;
    el.style.animation='none';void el.offsetWidth;
    const map={fade:'rafFadeIn',slide:'rafSlideIn',zoom:'rafZoomIn'};if(map[a])el.style.animation=`${map[a]} var(--raf-anim-duration,700ms) both`;
  });
}
function ensureAnimationCSS(){if(document.querySelector('#rafBuilderAnimCss'))return;const s=document.createElement('style');s.id='rafBuilderAnimCss';s.textContent='@keyframes rafFadeIn{from{opacity:0}to{opacity:1}}@keyframes rafSlideIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}@keyframes rafZoomIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}';document.head.appendChild(s)}
function render(raw={}){current=raw;ensureAnimationCSS();applyElements(raw);applySections(raw);applyAnimations()}
if(!EDITOR_MODE)onValue(ref(db,`${WEBSITE_ROOT}/public/builder`),s=>render(s.val()||{}));
addEventListener('resize',()=>{if(!EDITOR_MODE)render(current)});

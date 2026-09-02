// RAF.studio — public free layout v6.6.1 UNIFIED GROUPS
import { initializeApp,getApps,getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase,ref,onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig,WEBSITE_ROOT } from './firebase-config.js';
const Q=new URLSearchParams(location.search);if(!Q.has('editor')){
const app=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(app),$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],dev=()=>innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop';
let layout={},timer=null;
const textSel='[data-home-text],#heroK,#heroT,#heroD';
const candidates=`[data-raf-free],.actions,.contactActions,.facts>.card,.offerCard54,.googleSummary54,.reviewCard54,.trustedLogo54,[data-raf-element]:not(.nav):not(.navlinks):not(.brand),[data-home-media],${textSel},.raf-custom-section [data-custom62="title"],.raf-custom-section [data-custom62="text"],.raf-custom-section [data-custom62="button"],.raf-custom-section [data-custom62="image"],.raf-custom-section [data-custom62="video"]`;
function keyFor(el){if(!el)return'';if(el.dataset.rafFreeKey)return el.dataset.rafFreeKey;if(el.id==='heroK'||el.id==='heroT'||el.id==='heroD')return`tx:${el.id}`;if(el.dataset.homeText)return`tx:${el.dataset.homeText}`;if(el.dataset.rafElement)return`re:${el.dataset.rafElement}`;if(el.dataset.homeMedia)return`hm:${el.dataset.homeMedia}`;if(el.dataset.custom62Id&&el.dataset.custom62)return`cs:${el.dataset.custom62Id}:${el.dataset.custom62}`;if(el.classList.contains('actions')&&el.closest('[data-raf-section="Hero"],header.hero'))return'hero:actions';if(el.classList.contains('contactActions'))return'contact:actions';if(el.matches('.facts>.card'))return`about:fact:${[...el.parentElement.children].indexOf(el)}`;if(el.dataset.offerIndex!=null)return`offer:${el.dataset.offerIndex}`;if(el.dataset.reviewIndex!=null)return`review:${el.dataset.reviewIndex}`;if(el.dataset.brandIndex!=null)return`brand:${el.dataset.brandIndex}`;const sec=el.closest('[data-raf-section]')?.dataset.rafSection||'page',parent=el.parentElement,idx=parent?[...parent.children].indexOf(el):0;return`${sec}:${el.tagName.toLowerCase()}:${idx}`}
function cfg(k){const d=dev(),desk=layout.desktop?.[k]||{},c=layout[d]?.[k]||{};return d==='desktop'?desk:{...desk,...c}}
function apply(){ $$(candidates).forEach(el=>{const k=keyFor(el);if(!k)return;el.dataset.rafFreeKey=k;const c=cfg(k);if(!c||!Object.keys(c).length)return;el.style.position='relative';el.style.left=`${Number(c.x)||0}px`;el.style.top=`${Number(c.y)||0}px`;if(c.z)el.style.zIndex=String(c.z);if(c.hidden)el.style.display='none'}) }
function schedule(){clearTimeout(timer);requestAnimationFrame(apply);timer=setTimeout(apply,160);setTimeout(apply,650)}
onValue(ref(db,`${WEBSITE_ROOT}/public/builder/freeLayout`),s=>{layout=s.val()||{};schedule()});
const obs=new MutationObserver(schedule);obs.observe(document.body,{childList:true,subtree:true});addEventListener('resize',schedule,{passive:true});
}

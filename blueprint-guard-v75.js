// RAF.studio — Blueprint guard + editor bindings v7.5
import './blueprint-hero-v75.js?v=7.5.0';
const EDITOR=new URLSearchParams(location.search).has('editor');
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function css(){if($('#rafBlueprintGuard75'))return;const s=document.createElement('style');s.id='rafBlueprintGuard75';s.textContent=`
/* permanent guard: blueprint page never falls back to legacy sections */
body[data-tpl75] #rafMain>[data-raf-section]:not(.tpl75Section),body[data-tpl75] #rafOffer54,body[data-tpl75] #rafStats61{display:none!important}
body[data-tpl75] header.hero{display:grid!important}
/* hard fix for squeezed FOTO/FILM captions from old transforms/layouts */
.portal{display:flex!important;align-items:flex-end!important;justify-content:flex-start!important}
.portal>div{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;translate:none!important;width:min(86%,620px)!important;max-width:86%!important;min-width:0!important}
.portal>div h3,.portal>div p,.portal>div span{white-space:normal!important;word-break:normal!important;overflow-wrap:normal!important;max-width:100%!important}
/* blueprint editor affordances */
body.raf-e3 .tpl75Section[data-raf-section],body.raf-e3 .tpl75Section [data-raf-free]{cursor:pointer}
`;document.head.appendChild(s)}
function stablePath(el,root){const p=[];let n=el;while(n&&n!==root&&p.length<5){const par=n.parentElement;if(!par)break;const siblings=[...par.children].filter(x=>x.tagName===n.tagName);p.unshift(`${n.tagName.toLowerCase()}${siblings.length>1?'-'+siblings.indexOf(n):''}`);n=par}return p.join('_')||el.tagName.toLowerCase()}
function bind(){if(!EDITOR)return;$$('.tpl75Section').forEach((sec,i)=>{const kind=[...sec.classList].find(x=>x.startsWith('tpl75-')&&x!=='tpl75Section')||'section';sec.dataset.rafSection=`Tpl75-${i}-${kind.replace('tpl75-','')}`;sec.dataset.rafFree='1';const items=$$('h2,h3,p,blockquote,a,button,img,article,form,input,select,textarea,strong,b,span',sec);items.forEach(el=>{if(el.dataset.rafElement||el.dataset.homeText||el.dataset.homeMedia)return;el.dataset.rafFree='1';el.dataset.rafV7Id=`bp75:${i}:${stablePath(el,sec)}`})})}
function run(){css();bind()}
run();let timer;const obs=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,35)});obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-tpl75']});setTimeout(()=>obs.disconnect(),15000);

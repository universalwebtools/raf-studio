// RAF.studio — Blueprint guard + editor bindings v7.5.2 WYSIWYG
import './blueprint-hero-v75.js?v=7.5.2';
import './blueprint-longform-v751.js?v=7.5.2';
import './template-engine-v752.js?v=7.5.2';
const EDITOR=new URLSearchParams(location.search).has('editor');
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function css(){if($('#rafBlueprintGuard75'))return;const s=document.createElement('style');s.id='rafBlueprintGuard75';s.textContent=`
body[data-tpl75] #rafMain>[data-raf-section]:not(.tpl75Section),body[data-tpl75] #rafOffer54,body[data-tpl75] #rafStats61{display:none!important}
body[data-tpl75] header.hero{display:grid!important}
body[data-e752] #rafMain,body[data-e752] .tpl751,body[data-e752] #rafOffer54,body[data-e752] #rafStats61{display:none!important}
.portal{display:flex!important;align-items:flex-end!important;justify-content:flex-start!important}
.portal>div{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;translate:none!important;width:min(86%,620px)!important;max-width:86%!important;min-width:0!important}
.portal>div h3,.portal>div p,.portal>div span{white-space:normal!important;word-break:normal!important;overflow-wrap:normal!important;max-width:100%!important}
body.raf-e3 .tpl75Section[data-raf-section],body.raf-e3 .tpl75Section [data-raf-free],body.raf-e3 #rafTemplate752 [data-raf-free]{cursor:pointer}
`;document.head.appendChild(s)}
function stablePath(el,root){const p=[];let n=el;while(n&&n!==root&&p.length<5){const par=n.parentElement;if(!par)break;const siblings=[...par.children].filter(x=>x.tagName===n.tagName);p.unshift(`${n.tagName.toLowerCase()}${siblings.length>1?'-'+siblings.indexOf(n):''}`);n=par}return p.join('_')||el.tagName.toLowerCase()}
function bindLegacy(){if(!EDITOR)return;$$('.tpl75Section').forEach((sec,i)=>{const kind=[...sec.classList].find(x=>x.startsWith('tpl75-')&&x!=='tpl75Section')||[...sec.classList].find(x=>x.startsWith('tpl751-'))||'section';sec.dataset.rafSection=`Tpl75-${i}-${kind.replace('tpl75-','').replace('tpl751-','')}`;sec.dataset.rafFree='1';$$('h2,h3,p,blockquote,a,button,img,article,form,input,select,textarea,strong,b,span,details,summary',sec).forEach(el=>{if(el.dataset.rafElement||el.dataset.homeText||el.dataset.homeMedia)return;el.dataset.rafFree='1';el.dataset.rafV7Id=`bp75:${i}:${stablePath(el,sec)}`})})}
function bind752(){if(!EDITOR)return;const root=$('#rafTemplate752');if(!root)return;$$('[data-e752-sec]',root).forEach((sec,i)=>{sec.dataset.rafFree='1';$$('h1,h2,h3,p,blockquote,a,button,img,article,form,input,select,textarea,strong,b,span,details,summary',sec).forEach((el,k)=>{el.dataset.rafFree='1';if(!el.dataset.rafV7Id)el.dataset.rafV7Id=`e752:${document.body.dataset.e752||'tpl'}:${i}:${k}`})})}
function run(){css();bindLegacy();bind752()}
run();let timer;const obs=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,35)});obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-tpl75','data-e752']});window.addEventListener('raf:template752-rendered',run);setTimeout(()=>obs.disconnect(),45000);

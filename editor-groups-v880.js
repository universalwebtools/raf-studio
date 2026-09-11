// RAF.studio — Smart Groups + Breadcrumbs v8.8.0
// Explicit merge/split controls, selection breadcrumbs and alignment inside
// an existing group without moving the surrounding section/container.
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const VERSION='8.8.0';
let core=null,queued=false;

function status(t){const e=$('#rafStatus3');if(e)e.textContent=t}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function selected(){core=core||window.rafCore760||window.rafCore72;return core?.selected?.()||[]}
function cfg(el){try{return core?.cfgFor?.(el)||{}}catch{return{}}}
function groupId(el){return String(cfg(el)?.group||'')}
function sameGroup(items){if(items.length<2)return'';const g=groupId(items[0]);return g&&items.every(x=>groupId(x)===g)?g:''}
function locked(el){return!!cfg(el)?.locked}

function css(){
 if($('#v880groupCss'))return;const s=document.createElement('style');s.id='v880groupCss';s.textContent=`
#v880groupTools{border:1px solid #a54cff44;background:linear-gradient(145deg,#160d24,#0b1017);border-radius:11px;padding:10px;margin:9px 0 12px;color:#fff}
#v880crumb{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:10px;font:800 10px/1.3 system-ui;color:#d7dbe0}
#v880crumb .v880chip{border:1px solid #ffffff18;background:#ffffff07;border-radius:999px;padding:5px 7px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#v880crumb .v880sep{color:#6f7780}.v880head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin:2px 0 7px}.v880head b{font:900 9px/1 system-ui;letter-spacing:.12em;color:#bd8cff}.v880head small{font:9px system-ui;color:#777}
.v880align{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:6px}.v880align button{border:1px solid #ffffff20;background:#17181b;color:#fff;border-radius:8px;padding:7px 3px;cursor:pointer;font:800 9px system-ui}.v880align button:disabled{opacity:.32;cursor:not-allowed}.v880note{margin-top:7px;color:#737a82;font:9px/1.4 system-ui}
#v72g,#v72ug{font-weight:900!important}#v72g:disabled,#v72ug:disabled{opacity:.35!important;cursor:not-allowed!important}
`;
 document.head.appendChild(s)
}

function sectionLabel(el){
 const sec=el?.closest?.('[data-raf-section],[data-home-section],.tpl75Section,header.hero');if(!sec)return'STRONA';
 if(sec.matches('.tpl75-faq'))return'FAQ';
 const raw=sec.dataset.rafSection||sec.dataset.homeSection||'',map={Hero:'HERO',About:'O MNIE',TwoWorlds:'DWA ŚWIATY',Reviews:'OPINIE',Brands:'MARKI',Contact:'KONTAKT'};
 if(map[raw])return map[raw];if(raw)return String(raw).replace(/[_-]+/g,' ').toUpperCase();
 const cls=[...sec.classList].find(x=>/^tpl75-/.test(x)&&x!=='tpl75Section');return cls?cls.replace(/^tpl75-/,'').replace(/[-_]+/g,' ').toUpperCase():'SEKCJA'
}
function detailsIndex(el){const d=el?.closest?.('details');if(!d)return 0;const sec=d.closest('.tpl75-faq,[data-raf-section],[data-home-section],section')||d.parentElement;return Math.max(1,[...sec.querySelectorAll('details')].indexOf(d)+1)}
function leafLabel(el){
 if(!el)return'ELEMENT';
 if(el.matches('img,picture'))return'ZDJĘCIE';if(el.matches('video'))return'FILM';if(el.matches('a,button,[role="button"]'))return'PRZYCISK';if(el.matches('h1,h2,h3,h4,h5,h6,blockquote'))return'NAGŁÓWEK';if(el.matches('p,span,b,strong,small,em,figcaption,label,li,summary'))return'TEKST';return(el.tagName||'ELEMENT').toUpperCase()
}
function crumbsFor(el){const out=[sectionLabel(el)],i=detailsIndex(el);if(i)out.push(el.closest('summary')?'Pytanie '+i:el.closest('details>p')?'Odpowiedź '+i:'FAQ '+i);out.push(leafLabel(el));return out}
function commonPrefix(paths){if(!paths.length)return[];const out=[];for(let i=0;;i++){const v=paths[0][i];if(v==null||!paths.every(p=>p[i]===v))break;out.push(v)}return out}
function breadcrumb(items){
 if(!items.length)return[];if(items.length===1)return crumbsFor(items[0]);const paths=items.map(crumbsFor),prefix=commonPrefix(paths),g=sameGroup(items);if(prefix.length&&prefix.at(-1)==='TEKST')prefix.pop();prefix.push(g?`Grupa • ${items.length} elementów`:`Zaznaczenie • ${items.length} elementów`);return prefix
}

function mergeSelected(){
 core=core||window.rafCore760||window.rafCore72;const items=selected().filter(x=>x?.isConnected);if(items.length<2){status('Zaznacz co najmniej 2 elementy, aby je scalić');return}
 core.checkpoint?.();const g='g880_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,5);for(const el of items)core.patchOne?.(el,{group:g},{commitNow:false});core.save?.();core.refresh?.();status('✓ Scalono '+items.length+' elementów w jedną grupę');schedule()
}
function splitGroup(){
 core=core||window.rafCore760||window.rafCore72;const items=selected().filter(x=>x?.isConnected&&groupId(x));if(!items.length){status('Zaznaczenie nie należy do grupy');return}
 core.checkpoint?.();for(const el of items)core.patchOne?.(el,{group:''},{commitNow:false});core.save?.();core.refresh?.();status('✓ Rozdzielono grupę');schedule()
}
function unionRect(items){const rs=items.map(x=>x.getBoundingClientRect()).filter(r=>r.width||r.height);if(!rs.length)return null;const left=Math.min(...rs.map(r=>r.left)),top=Math.min(...rs.map(r=>r.top)),right=Math.max(...rs.map(r=>r.right)),bottom=Math.max(...rs.map(r=>r.bottom));return{left,top,right,bottom,width:right-left,height:bottom-top}}
function alignInside(mode){
 core=core||window.rafCore760||window.rafCore72;const items=selected().filter(x=>x?.isConnected&&!locked(x)),g=sameGroup(items);if(items.length<2||!g){status('Najpierw wybierz jedną scaloną grupę');return}
 const b=unionRect(items);if(!b)return;const changes=items.map(el=>{const r=el.getBoundingClientRect(),c=cfg(el),p={x:Number(c.x)||0,y:Number(c.y)||0};if(mode==='left')p.x+=b.left-r.left;if(mode==='center')p.x+=(b.left+b.width/2)-(r.left+r.width/2);if(mode==='right')p.x+=b.right-r.right;if(mode==='top')p.y+=b.top-r.top;if(mode==='middle')p.y+=(b.top+b.height/2)-(r.top+r.height/2);if(mode==='bottom')p.y+=b.bottom-r.bottom;return{el,p}});
 core.checkpoint?.();for(const x of changes)core.patchOne?.(x.el,x.p,{commitNow:false});core.save?.();core.refresh?.();status('✓ Wyrównano elementy wewnątrz grupy');schedule()
}

function versionLabels(){
 const q=new URLSearchParams(location.search);if((q.get('ev')||VERSION)!==VERSION)return;
 const select=$('#editorVersion770 select,[id^="editorVersion"] select');if(select){let o=[...select.options].find(x=>x.value===VERSION);if(!o){o=document.createElement('option');o.value=VERSION;o.textContent='8.8.0 — SMART GROUPS + BREADCRUMBS';select.insertBefore(o,select.firstChild)}select.value=VERSION}
 for(const el of $$('#v72panel small,#rafPanel3 small'))if(/V8\.[0-9.]+ CORE/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/V8\.[0-9.]+ CORE/i,'V8.8.0 CORE');
 try{if(parent&&parent!==window){const b=parent.document.querySelector('.bar b');if(b&&/RESPONSIVE/i.test(b.textContent||''))b.textContent='RAF.studio — RESPONSIVE 8.8.0'}}catch{}
}
function wireLegacyButtons(items){const g=$('#v72g'),ug=$('#v72ug');if(g){g.textContent='🔗 SCAL ZAZNACZONE';g.disabled=items.length<2;g.onclick=mergeSelected}if(ug){ug.textContent='⛓ ROZDZIEL GRUPĘ';ug.disabled=!items.some(groupId);ug.onclick=splitGroup}}
function render(){
 queued=false;core=window.rafCore760||window.rafCore72;if(!core)return;css();versionLabels();const items=selected(),panel=$('#v72panel');$('#v880groupTools')?.remove();if(!items.length||!panel)return;wireLegacyButtons(items);
 const g=sameGroup(items),crumbs=breadcrumb(items),box=document.createElement('div');box.id='v880groupTools';box.innerHTML=`<div id="v880crumb">${crumbs.map((x,i)=>`${i?'<span class="v880sep">›</span>':''}<span class="v880chip">${esc(x)}</span>`).join('')}</div><div class="v880head"><b>WYRÓWNANIE WEWNĄTRZ GRUPY</b><small>${g?items.length+' elementów':'najpierw scal zaznaczenie'}</small></div><div class="v880align"><button data-v880-align="left" ${g?'':'disabled'}>← Lewo</button><button data-v880-align="center" ${g?'':'disabled'}>↔ Środek</button><button data-v880-align="right" ${g?'':'disabled'}>Prawo →</button><button data-v880-align="top" ${g?'':'disabled'}>↑ Góra</button><button data-v880-align="middle" ${g?'':'disabled'}>↕ Środek</button><button data-v880-align="bottom" ${g?'':'disabled'}>↓ Dół</button></div><div class="v880note">Wyrównanie rusza wyłącznie elementy zaznaczonej grupy. Sekcja i pozostałe elementy strony zostają na miejscu.</div>`;
 const h3=panel.querySelector('h3');if(h3)h3.insertAdjacentElement('afterend',box);else panel.prepend(box);$$('[data-v880-align]',box).forEach(b=>b.onclick=()=>alignInside(b.dataset.v880Align))
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(render)}
for(const ev of ['raf:v760-ready','raf:v760-selection','raf:v760-change','raf:universal-elements-ready','raf:template752-rendered','raf:history-main'])window.addEventListener(ev,()=>{schedule();setTimeout(schedule,60)});
new MutationObserver(()=>schedule()).observe(document.documentElement,{subtree:true,childList:true});
let tries=0,t=setInterval(()=>{versionLabels();if(window.rafCore760||window.rafCore72){schedule();if(++tries>35)clearInterval(t)}},160);
window.rafGroups880={merge:mergeSelected,split:splitGroup,align:alignInside,breadcrumb:()=>breadcrumb(selected())};

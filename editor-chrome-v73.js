// RAF.studio — editor chrome v8.8.3
const $=(s,r=document)=>r.querySelector(s);
const q=new URLSearchParams(location.search),LATEST=window.rafEditorReleases?.[0]||'8.8.3',ver=q.get('ev')||LATEST;
const LABELS={
 '8.8.3':'WIDGET VIDEO + PARITY + SMART GROUPS','8.8.2':'FAQ COMPONENTS + SMART GROUPS','8.8.1':'FAQ SCALONE + SMART GROUPS','8.8.0':'SMART GROUPS + BREADCRUMBS',
 '8.7.7':'FAQ SCALONE + RESPONSIVE DOCK','8.7.6':'CTRL+Z + SAFE CONTROLS + DOCK','8.7.2':'SKALOWANIE MULTI-SELECT','8.7.1':'CZUŁE HISTORIE + 100 UNIQUE','8.7.0':'100 CAŁKIEM INNYCH STRON',
 '8.6.2':'PEŁNE CTRL+Z','8.6.1':'STABILNY DWUKLIK WIDŻETÓW','8.6.0':'WIDŻETY LINK + PODSTRONY','8.5.2':'STAŁY PASEK + WERSJE','8.5.1':'EDYCJA TEKSTU 1:1','8.5.0':'PEŁNA TYPOGRAFIA',
 '8.4.0':'CZYSTY HERO + MOBILE CROP','8.3.0':'KOSZ + WIZUALNY HERO','8.2.2':'HISTORIA + HERO VIDEO FIX','8.2.1':'AUTO NAPRAWA + PUBLIKACJA','8.2.0':'29 WIDŻETÓW + MOBILE FIX',
 '8.1.0':'VIDEO SAFE + 100 UNIQUE','8.0.0':'100 SZABLONÓW + PRIVACY','7.7.2':'DWUKLIK + KOLEJNOŚĆ','7.7.1':'14 WIDŻETÓW','7.6.0':'WORKSPACE + SAFE PUBLISH',
 '7.5.6':'LINIE + MAGNES','7.5.5':'30 UNIQUE LIVE PREVIEWS','7.5.4':'WIDE PREVIEWS + SCROLL','7.5.3':'30 LIVE TEMPLATES','7.5.2':'WYSIWYG','7.5.1':'LONGFORM','7.5':'BLUEPRINTS',
 '7.4.1':'TRUE RESET + RESPONSIVE','7.4':'REAL TEMPLATES','7.3':'FULL TEMPLATES + MOBILE','7.2':'TEMPLATES 2.0','7.0':'CORE'
};
function selected(){return $('.rsel')||$('.sel55')||$('.pro61-selected')||$('.custom62-selected')||$('.v72sel')}
function inPreview(){return document.body.classList.contains('raf-preview631')||document.body.classList.contains('raf-preview632')||document.body.classList.contains('raf-preview64')}
function inject(){if($('#rafChrome75Css'))return;const s=document.createElement('style');s.id='rafChrome75Css';s.textContent='body.raf-e3>.nav{display:none!important}body.raf-e3 #rafPanel3{display:none}body.raf-e3 #rafPanel3.raf-panel-open62{display:block!important}body.raf-preview631 #rafPanel3,body.raf-preview632 #rafPanel3,body.raf-preview64 #rafPanel3{display:none!important}';document.head.appendChild(s)}
function syncPanel(){const p=$('#rafPanel3');if(!p)return;if(inPreview()){p.classList.remove('raf-panel-open62');p.style.setProperty('display','none','important');return}p.style.removeProperty('display');if(selected()){p.classList.add('raf-panel-open62');p.style.display='block'}else{p.classList.remove('raf-panel-open62');p.style.display='none'}}
function versions(){const live=Array.isArray(window.rafEditorReleases)?window.rafEditorReleases:[LATEST,'8.8.2','8.8.1','8.8.0','8.7.7','8.7.6','8.7.2','8.7.1','8.7.0'];return [...new Set(live)]}
function init(){
 inject();const top=$('#rafTop3');if(!top)return false;top.querySelector(':scope > b')?.remove();$('#grid3')?.remove();$('#hist3')?.remove();$('#rafNav3')?.remove();$('#mobileEditorBtn73')?.remove();
 const ids=['editorVersion55','editorVersion60','editorVersion61','editorVersion62','editorVersion621','editorVersion63','editorVersion631','editorVersion64','editorVersion65','editorVersion651','editorVersion652','editorVersion653','editorVersion66','editorVersion661','editorVersion70','editorVersion71','editorVersion72','editorVersion73','editorVersion74','editorVersion741','editorVersion75','editorVersion751','editorVersion752','editorVersion753','editorVersion754','editorVersion755','editorVersion756','editorVersion760','editorVersion770'];
 ids.forEach(id=>$('#'+id)?.remove());const st=$('#rafStatus3');if(st&&!/Zmiany|Opublik|Błąd|Cofanie|Ponawianie|Synchron|Usuw|Szablon/i.test(st.textContent))st.textContent='✓ Edytor '+ver+' • '+(LABELS[ver]||'NAJNOWSZA WERSJA');
 const w=document.createElement('label');w.id='editorVersion770';w.style.cssText='display:flex;align-items:center;gap:5px;color:#aaa;font:10px system-ui';const opts=versions().map(v=>`<option value="${v}">${v} — ${LABELS[v]||'ARCHIWALNA WERSJA'}</option>`).join('');w.innerHTML=`<span>Wersja</span><select style="background:#080809;color:#fff;border:1px solid #ffffff22;border-radius:8px;padding:6px">${opts}</select>`;
 top.insertBefore(w,$('#templatesBtn752')||$('#proBtn61')||$('#add3')||top.firstChild);const s=w.querySelector('select');s.value=ver;s.onchange=()=>{if(window.rafGoEditorVersion){window.rafGoEditorVersion(s.value);return}const u=new URL(location.href);u.searchParams.set('editor','direct');u.searchParams.set('ev',s.value);u.searchParams.set('_editorBuild',window.rafEditorBuildFor?.(s.value)||'8830');location.href=u.toString()};
 const p=$('#pageSelect4');if(p)p.onchange=e=>{const u=new URL(e.target.value,location.href);u.searchParams.set('editor','direct');u.searchParams.set('ev',ver);u.searchParams.set('_editorBuild',window.rafEditorBuildFor?.(ver)||'8830');location.href=u.toString()};syncPanel();return true
}
let n=0,t=setInterval(()=>{if(init()||++n>120)clearInterval(t)},50);const schedule=()=>requestAnimationFrame(syncPanel);for(const ev of ['click','pointerup','keyup'])document.addEventListener(ev,schedule,true);
document.addEventListener('click',e=>{if(inPreview())return;if(e.target.closest('#rafTop3,#rafPanel3,#rafProModal61,#tpl752,#widgetsModal770,#pages860,.rsel,.sel55,.pro61-selected,.custom62-selected,.v72sel,#v72box,.rbox3,.tpl75Section,#rafTemplate752,#v760layers,#v760menu,#v760history,#v760publishCheck'))return;setTimeout(()=>{const p=$('#rafPanel3');if(p&&!selected()){p.innerHTML='';syncPanel()}},0)},true);
window.rafSyncPanel64=syncPanel;window.rafSyncPanel631=syncPanel;

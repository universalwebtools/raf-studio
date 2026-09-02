// RAF.studio — Templates panel v7.2.2
import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,set} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {TEMPLATE72} from './template-runtime-v72.js?v=7.2.2';
const db=getDatabase(getApp()),$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ROOT='website/public';
const META={
'raf-signature':['RAF Signature','Filmowy, premium, wyważony'],
'cinematic-black':['Cinematic Black','Duży obraz, ciemny klimat'],
'minimal-mono':['Minimal Mono','Prosto, czysto i geometrycznie'],
'editorial-mag':['Editorial Magazine','Magazynowy i asymetryczny'],
'luxury-gold':['Luxury Gold','Elegancki premium'],
'clean-white':['Clean White','Jasny i nowoczesny'],
'soft-beige':['Soft Beige','Ciepły lifestyle'],
'wedding-story':['Wedding Story','Reportaż ślubny i emocje'],
'product-studio':['Product Studio','Produkt i biznes'],
'documentary':['Documentary','Surowy reportaż'],
'bold-type':['Bold Type','Duża typografia'],
'split-hero':['Split Hero','Hero dzielone na pół'],
'gallery-first':['Gallery First','Obraz przed tekstem'],
'portfolio-mag':['Portfolio Magazine','Portfolio jak magazyn'],
'neon-night':['Neon Night','Dynamiczny dark'],
'corporate-premium':['Corporate Premium','Spokojny biznes premium'],
'social-motion':['Social Motion','Film i social media'],
'fullscreen-visual':['Fullscreen Visual','Minimum tekstu, maksimum obrazu'],
'mono-grid':['Mono Grid','Siatka black & white'],
'warm-film':['Warm Film','Ciepły kinowy klimat']
};
function ensureCss(){if($('#tpl722css'))return;const s=document.createElement('style');s.id='tpl722css';s.textContent=`
#tpl722{position:fixed;inset:62px 20px 20px;z-index:1000300;background:#0d0d10f5;border:1px solid #ffffff22;border-radius:18px;display:none;grid-template-rows:auto 1fr auto;color:#fff;font:13px system-ui;backdrop-filter:blur(22px);box-shadow:0 30px 100px #000b}
#tpl722.open{display:grid}.tpl722head,.tpl722foot{padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px}.tpl722head{border-bottom:1px solid #ffffff14}.tpl722foot{border-top:1px solid #ffffff14}.tpl722grid{overflow:auto;padding:16px;display:grid;grid-template-columns:repeat(4,minmax(210px,1fr));gap:12px}.tpl722card{border:2px solid transparent;background:#151518;border-radius:14px;overflow:hidden;cursor:pointer;transition:.15s}.tpl722card:hover{transform:translateY(-2px);border-color:#ffffff30}.tpl722card.sel{border-color:#20a7ff;box-shadow:0 0 0 3px #20a7ff20}.tpl722mini{height:135px;background:linear-gradient(140deg,#24242b,#08080b);padding:13px;display:grid;grid-template-rows:auto 1fr auto;gap:9px}.tpl722mini .nav{width:52%;height:6px;background:#fff;border-radius:99px;opacity:.8}.tpl722mini .hero{display:grid;grid-template-columns:1.2fr .8fr;gap:8px}.tpl722mini .hero b{font-size:20px;line-height:.85;align-self:center}.tpl722mini .pic{background:linear-gradient(135deg,#2da9ff,#9c4dff);border-radius:7px;opacity:.7}.tpl722mini .blocks{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.tpl722mini .blocks i{height:18px;border:1px solid #ffffff30;border-radius:4px}.tpl722body{padding:11px}.tpl722body h3{margin:0 0 4px}.tpl722body p{margin:0;color:#94949b;font-size:11px}.tpl722head button,.tpl722foot button{border:1px solid #ffffff22;background:#19191d;color:#fff;border-radius:8px;padding:8px 11px;cursor:pointer}.tpl722foot .use{background:#fff;color:#111;font-weight:900}.tpl722foot button:disabled{opacity:.35;cursor:not-allowed}@media(max-width:1000px){.tpl722grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:720px){.tpl722grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function createModal(){ensureCss();let m=$('#tpl722');if(m)return m;const ids=Object.keys(TEMPLATE72);m=document.createElement('div');m.id='tpl722';m.innerHTML=`<div class="tpl722head"><div><b style="font-size:17px">SZABLONY STRONY</b><div style="font-size:11px;color:#888;margin-top:3px">20 gotowych konstrukcji: HERO, sekcje, galerie, O mnie, opinie, marki i typografia.</div></div><button id="tpl722close">✕ Zamknij</button></div><div class="tpl722grid">${ids.map(id=>`<article class="tpl722card" data-id="${id}"><div class="tpl722mini"><span class="nav"></span><div class="hero"><b>${META[id][0].toUpperCase()}</b><span class="pic"></span></div><div class="blocks"><i></i><i></i><i></i></div></div><div class="tpl722body"><h3>${META[id][0]}</h3><p>${META[id][1]}</p></div></article>`).join('')}</div><div class="tpl722foot"><span>Wybrany: <b id="tpl722name">—</b></span><div style="display:flex;gap:7px"><button id="tpl722use" class="use" disabled>UŻYJ SZABLONU</button><button id="tpl722new" disabled>NOWY START</button></div></div>`;document.body.appendChild(m);let chosen='';$('#tpl722close').onclick=()=>m.classList.remove('open');$$('.tpl722card',m).forEach(card=>card.onclick=()=>{chosen=card.dataset.id;$$('.tpl722card',m).forEach(x=>x.classList.toggle('sel',x===card));$('#tpl722name').textContent=META[chosen][0];$('#tpl722use').disabled=false;$('#tpl722new').disabled=false});$('#tpl722use').onclick=()=>chosen&&applyTemplate(chosen,false);$('#tpl722new').onclick=()=>chosen&&applyTemplate(chosen,true);return m}
async function backup(){const snap=await get(ref(db,`${ROOT}/editorDraft`));await set(ref(db,`${ROOT}/templateBackupLatest`),{savedAt:Date.now(),draft:snap.val()||{}})}
async function applyTemplate(id,fresh){const name=META[id]?.[0];if(!name)return;if(!confirm(fresh?`Zacząć nowy układ z szablonu „${name}”?\n\nZrobię backup obecnego projektu.`:`Zastosować układ „${name}”?\n\nTreści i media zostają.`))return;const st=$('#rafStatus3');if(st)st.textContent='Stosowanie szablonu…';try{await backup();const snap=await get(ref(db,`${ROOT}/editorDraft`)),draft=snap.val()||{};draft.builder||={};draft.builder.templateV72={id,appliedAt:Date.now()};draft.builder.freeLayoutV7={desktop:{},tablet:{},mobile:{}};if(fresh){draft.builder.customSections=[];draft.builder.clones=[]}await set(ref(db,`${ROOT}/editorDraft`),draft);$('#tpl722')?.classList.remove('open');if(st)st.textContent=`✓ ${name} zastosowany`;setTimeout(()=>location.reload(),220)}catch(e){console.error(e);alert('Błąd szablonu: '+e.message);if(st)st.textContent='Błąd szablonu'}}
function installButton(){const top=$('#rafTop3');if(!top)return false;$('#templatesBtn71')?.remove();$('#templatesBtn72')?.remove();if($('#templatesBtn722'))return true;const b=document.createElement('button');b.id='templatesBtn722';b.textContent='▦ SZABLONY';b.onclick=()=>createModal().classList.add('open');top.insertBefore(b,$('#proBtn61')||$('#add3')||top.lastChild);return true}
let tries=0;const timer=setInterval(()=>{if(installButton()||++tries>160)clearInterval(timer)},50);

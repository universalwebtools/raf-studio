// RAF.studio — Templates panel v7.2
import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,set} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {TEMPLATE72} from './template-runtime-v72.js?v=7.2.0';
const db=getDatabase(getApp()),$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],ROOT='website/public';
const NAMES={
'raf-signature':['RAF Signature','Ciemny, filmowy, wyważony'],
'cinematic-black':['Cinematic Black','HERO nisko, asymetryczne portfolio'],
'minimal-mono':['Minimal Mono','Dużo oddechu, czysto i prosto'],
'editorial-mag':['Editorial Magazine','Magazynowy, asymetryczny układ'],
'luxury-gold':['Luxury Gold','Elegancki układ premium'],
'clean-white':['Clean White','Jasny, nowoczesny i czytelny'],
'soft-beige':['Soft Beige','Ciepły lifestyle / ślubny'],
'wedding-story':['Wedding Story','Reportaż i emocje na pierwszym planie'],
'product-studio':['Product Studio','Techniczny układ pod firmy i produkt'],
'documentary':['Documentary','Surowy reportaż i duża fotografia'],
'bold-type':['Bold Type','Gigantyczna typografia'],
'split-hero':['Split Hero','Treść po prawej stronie HERO'],
'gallery-first':['Gallery First','Najpierw obrazy, potem treść'],
'portfolio-mag':['Portfolio Magazine','Portfolio jak magazyn'],
'neon-night':['Neon Night','Nowoczesny, dynamiczny dark'],
'corporate-premium':['Corporate Premium','Spokojny układ biznes premium'],
'social-motion':['Social Motion','Dynamiczny układ do filmu/social'],
'fullscreen-visual':['Fullscreen Visual','Minimum tekstu, maksimum obrazu'],
'mono-grid':['Mono Grid','Geometryczna siatka black & white'],
'warm-film':['Warm Film','Ciepły kinowy klimat']};
const STYLES={
'raf-signature':['#050505','#f5f5f5','#999','#fff','Inter'],
'cinematic-black':['#000','#fff','#888','#cfcfcf','Arial'],
'minimal-mono':['#0b0b0b','#f4f4f2','#aaa','#e8e8e2','Helvetica'],
'editorial-mag':['#0a0908','#f2e9dc','#a99e91','#caa984','Georgia'],
'luxury-gold':['#090806','#f6f0e5','#9f9688','#c7a45c','Times New Roman'],
'clean-white':['#f7f7f4','#151515','#777','#111','Arial'],
'soft-beige':['#e9e0d4','#2a2621','#776c62','#9a7354','Georgia'],
'wedding-story':['#11100f','#fffaf4','#b8ada1','#e7cdb5','Georgia'],
'product-studio':['#07090b','#f4f7fa','#87929d','#28a9ff','Arial'],
'documentary':['#030303','#efefeb','#94948e','#e05135','Impact'],
'bold-type':['#050505','#fff','#a0a0a0','#ff3b30','Impact'],
'split-hero':['#050505','#fafafa','#a0a0a0','#77d4ff','Arial'],
'gallery-first':['#060606','#fafafa','#888','#fff','Helvetica'],
'portfolio-mag':['#0d0c0b','#f2eadf','#9e968d','#c65f45','Georgia'],
'neon-night':['#050509','#f7f7ff','#8e8ea5','#72ffcc','Arial'],
'corporate-premium':['#071018','#f4f7f8','#8fa1ad','#6ca6c4','Arial'],
'social-motion':['#080808','#fff','#9b9b9b','#ff5b35','Impact'],
'fullscreen-visual':['#030303','#fff','#929292','#fff','Helvetica'],
'mono-grid':['#000','#fff','#aaa','#fff','Arial'],
'warm-film':['#120d09','#f8eee3','#ad9988','#e59658','Georgia']};
const START_SITE={heroK:'FOTOGRAFIA • FILM • BIELSKO-BIAŁA',heroT:'OBRAZ, KTÓRY\nZOSTAJE.',heroD:'Fotografia i film tworzone z naciskiem na emocje, detal i nowoczesny, filmowy charakter.'};
const START_HOME={twoWorldsTitle:'DWA ŚWIATY.\nJEDEN STYL.',twoWorldsDesc:'Fotografia i film — dwa kierunki, jedna estetyka RAF.studio.',photoTitle:'FOTOGRAFIA',photoDesc:'Śluby, sesje, eventy, produkt i wizerunek.',photoButton:'Wejdź →',filmTitle:'FILM',filmDesc:'Reklama, eventy, social media, produkt i slow motion.',filmButton:'Wejdź →',aboutEyebrow:'O MNIE',aboutTitle:'CZŁOWIEK PO DRUGIEJ STRONIE KAMERY.',aboutDesc:'Tworzę zdjęcia i filmy dla ludzi oraz marek.',reviewsTitle:'OPINIE.',reviewsDesc:'Rekomendacje klientów.',brandsTitle:'ZAUFALI NAM.',brandsDesc:'Wybrane współprace.',contactEyebrow:'KONTAKT',contactTitle:'ZRÓBMY COŚ DOBREGO.',contactDesc:'Fotografia, film albo oba naraz.',showTwoWorlds:true,showAbout:true,showReviews:true,showBrands:true,showContact:true};
const ORDER={
'product-studio':['Offer','TwoWorlds','Stats','About','Brands','Reviews','Contact'],
'corporate-premium':['Offer','Stats','TwoWorlds','About','Brands','Reviews','Contact'],
'gallery-first':['TwoWorlds','Offer','Reviews','About','Brands','Stats','Contact'],
'wedding-story':['About','TwoWorlds','Offer','Reviews','Stats','Brands','Contact'],
'mono-grid':['Offer','TwoWorlds','Stats','Brands','Reviews','About','Contact']};
function css(){if($('#tpl72css'))return;const s=document.createElement('style');s.id='tpl72css';s.textContent=`#tpl72{position:fixed;inset:58px 18px 18px;z-index:1000200;background:#0b0b0ef2;border:1px solid #ffffff24;border-radius:20px;color:#fff;display:none;grid-template-rows:auto 1fr auto;font:13px system-ui;box-shadow:0 30px 100px #000c;backdrop-filter:blur(22px)}#tpl72.open{display:grid}.tpl72head,.tpl72foot{padding:14px 18px;border-bottom:1px solid #ffffff16;display:flex;align-items:center;justify-content:space-between;gap:12px}.tpl72foot{border-bottom:0;border-top:1px solid #ffffff16}.tpl72grid{padding:18px;overflow:auto;display:grid;grid-template-columns:repeat(4,minmax(220px,1fr));gap:14px}.tpl72card{background:#121214;border:2px solid transparent;border-radius:16px;overflow:hidden;cursor:pointer;transition:.16s}.tpl72card:hover{transform:translateY(-2px);border-color:#ffffff35}.tpl72card.sel{border-color:#23a9ff;box-shadow:0 0 0 3px #23a9ff25}.tpl72mini{height:158px;background:var(--bg);color:var(--tx);padding:13px;position:relative;box-sizing:border-box;overflow:hidden}.tpl72nav{height:6px;width:50%;background:var(--tx);opacity:.7;border-radius:4px}.tpl72hero{display:grid;grid-template-columns:1.2fr .8fr;gap:8px;margin-top:16px;height:68px}.tpl72hero b{font:900 20px/0.9 var(--font);align-self:center}.tpl72img{background:linear-gradient(135deg,var(--ac),var(--mu));opacity:.7;border-radius:7px}.tpl72sections{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:10px}.tpl72sections i{height:24px;border:1px solid color-mix(in srgb,var(--tx) 25%,transparent);border-radius:5px}.tpl72body{padding:12px}.tpl72body h3{margin:0 0 4px}.tpl72body p{margin:0;color:#96969d;font-size:11px;min-height:30px}.tpl72head button,.tpl72foot button{border:1px solid #ffffff22;background:#18181b;color:#fff;padding:9px 13px;border-radius:9px;cursor:pointer}.tpl72foot .go{background:#fff;color:#111;font-weight:900}.tpl72foot .fresh{background:#1d86d8;font-weight:800}.tpl72selected{color:#9bd4ff;font-weight:700}@media(max-width:1050px){.tpl72grid{grid-template-columns:repeat(3,minmax(210px,1fr))}}@media(max-width:760px){.tpl72grid{grid-template-columns:1fr}.tpl72foot{flex-wrap:wrap}}`;document.head.appendChild(s)}
function modal(){css();let m=$('#tpl72');if(m)return m;m=document.createElement('div');m.id='tpl72';m.innerHTML=`<div class="tpl72head"><div><b style="font-size:18px">SZABLONY STRONY • v7.2</b><div style="color:#888;font-size:11px;margin-top:3px">20 różnych konstrukcji strony — nie tylko kolory.</div></div><button id="tpl72x">✕ Zamknij</button></div><div class="tpl72grid">${Object.keys(TEMPLATE72).map(id=>{const [name,desc]=NAMES[id],st=STYLES[id];return`<article class="tpl72card" data-id="${id}"><div class="tpl72mini" style="--bg:${st[0]};--tx:${st[1]};--mu:${st[2]};--ac:${st[3]};--font:'${st[4]}'"><div class="tpl72nav"></div><div class="tpl72hero"><b>${name.toUpperCase()}</b><span class="tpl72img"></span></div><div class="tpl72sections"><i></i><i></i><i></i></div></div><div class="tpl72body"><h3>${name}</h3><p>${desc}</p></div></article>`}).join('')}</div><div class="tpl72foot"><div>Wybrany: <span class="tpl72selected" id="tpl72name">—</span></div><div style="display:flex;gap:7px"><button id="tpl72style" class="go" disabled>UŻYJ SZABLONU</button><button id="tpl72fresh" class="fresh" disabled>NOWY START</button></div></div>`;document.body.appendChild(m);$('#tpl72x').onclick=()=>m.classList.remove('open');let selected='';$$('.tpl72card',m).forEach(c=>{c.onclick=()=>{selected=c.dataset.id;$$('.tpl72card',m).forEach(x=>x.classList.toggle('sel',x===c));$('#tpl72name').textContent=NAMES[selected][0];$('#tpl72style').disabled=false;$('#tpl72fresh').disabled=false};c.ondblclick=()=>{selected=c.dataset.id;apply(selected,false)}});$('#tpl72style').onclick=()=>selected&&apply(selected,false);$('#tpl72fresh').onclick=()=>selected&&apply(selected,true);return m}
function toolbar(){const t=$('#rafTop3');if(!t||$('#templatesBtn72'))return false;$('#templatesBtn71')?.remove();const b=document.createElement('button');b.id='templatesBtn72';b.textContent='▦ SZABLONY';b.onclick=()=>modal().classList.add('open');t.insertBefore(b,$('#proBtn61')||$('#add3')||t.lastChild);return true}
async function backup(){const [d,p,e]=await Promise.all([get(ref(db,`${ROOT}/editorDraft`)),get(ref(db,`${ROOT}/proV6Draft`)),get(ref(db,`${ROOT}/editorExtrasDraft`))]);const state={draft:d.val()||{},pro:p.val()||{},extras:e.val()||{},savedAt:Date.now()};await set(ref(db,`${ROOT}/templateBackupLatest`),state);return state}
function zeroLegacyMoves(vs={}){for(const by of Object.values(vs.texts||{}))for(const c of Object.values(by||{})){if(c&&typeof c==='object'){c.moveX=0;c.moveY=0}}}
async function apply(id,fresh){const meta=TEMPLATE72[id],style=STYLES[id];if(!meta||!style)return;const name=NAMES[id][0],msg=fresh?`Zacząć nową stronę z szablonu „${name}”?\n\nNajpierw zapiszę backup. Biblioteka zdjęć i filmów zostaje.`:`Zastosować szablon „${name}”?\n\nZachowuję Twoje zdjęcia, teksty, portfolio, opinie i logotypy. Zmieniam układ, fonty i styl.`;if(!confirm(msg))return;const st=$('#rafStatus3');if(st)st.textContent='Tworzenie backupu…';try{const old=await backup(),d=structuredClone(old.draft||{}),p=structuredClone(old.pro||{});d.builder||={};d.builder.templateV72={id,appliedAt:Date.now()};d.builder.freeLayoutV7={desktop:{},tablet:{},mobile:{}};d.builder.sectionOrder=ORDER[id]||['TwoWorlds','About','Offer','Stats','Reviews','Brands','Contact'];d.visualStyles||={texts:{},sections:{}};zeroLegacyMoves(d.visualStyles);if(fresh){d.site=structuredClone(START_SITE);d.homeContent={...(d.homeContent||{}),...structuredClone(START_HOME)};d.builder.customSections=[];d.builder.clones=[];d.builder.locks={}}p.global={...(p.global||{}),bg:style[0],text:style[1],muted:style[2],accent:style[3],h1:id==='bold-type'?132:id==='editorial-mag'?118:96,h2:id==='bold-type'?82:64,body:16,radius:['minimal-mono','documentary','mono-grid'].includes(id)?2:16};p.button={...(p.button||{}),style:['minimal-mono','clean-white','product-studio','mono-grid'].includes(id)?'outline':'pill',bg:style[1],text:style[0],border:style[3],radius:['documentary','mono-grid'].includes(id)?0:999};p.sectionOrder=d.builder.sectionOrder;p.layoutBaseline='7.2-template';await Promise.all([set(ref(db,`${ROOT}/editorDraft`),d),set(ref(db,`${ROOT}/proV6Draft`),p)]);sessionStorage.setItem('rafTpl72Applied',name);$('#tpl72')?.classList.remove('open');if(st)st.textContent=`✓ ${name} zastosowany`;setTimeout(()=>location.reload(),250)}catch(e){console.error(e);alert('Błąd szablonu: '+e.message);if(st)st.textContent='Błąd szablonu'}}
let tries=0;const timer=setInterval(()=>{if(toolbar()||++tries>150)clearInterval(timer)},50);const done=sessionStorage.getItem('rafTpl72Applied');if(done){sessionStorage.removeItem('rafTpl72Applied');setTimeout(()=>{const s=$('#rafStatus3');if(s)s.textContent=`✓ Szablon „${done}” gotowy`},700)}

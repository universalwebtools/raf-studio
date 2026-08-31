import { getApps, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref as dbRef, get, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getStorage, ref as sRef, listAll, getDownloadURL, getMetadata, deleteObject } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(let i=0;i<100&&!getApps().length;i++) await sleep(50);
if(!getApps().length) throw new Error('Firebase nie zostało zainicjalizowane.');

const app=getApp();
const storage=getStorage(app);
const db=getDatabase(app);
let files=[];
let filter='all';
let query='';

const style=document.createElement('style');
style.textContent=`
.mediaLibraryCard{margin-top:18px}.mediaLibraryHead{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:14px}.mediaLibraryTools{display:flex;gap:8px;flex-wrap:wrap}.mediaLibraryTools input{min-width:220px}.mediaLibraryGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}.mediaTile{border:1px solid #ffffff16;background:#0c0c0d;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;min-width:0}.mediaThumb{aspect-ratio:4/3;background:#080809;display:grid;place-items:center;overflow:hidden}.mediaThumb img,.mediaThumb video{width:100%;height:100%;object-fit:cover}.mediaVideoIcon{font-size:38px;opacity:.65}.mediaBody{padding:11px;display:grid;gap:8px}.mediaName{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mediaMeta{font-size:11px;color:#999}.mediaActions{display:flex;gap:6px;flex-wrap:wrap}.mediaActions button,.mediaActions a{font-size:11px;padding:7px 9px;border-radius:999px;border:1px solid #ffffff18;background:#ffffff09;color:#ddd;text-decoration:none;cursor:pointer}.mediaActions .danger{color:#ff9b9b}.mediaEmpty{padding:26px;border:1px dashed #ffffff20;border-radius:14px;color:#999;text-align:center}.mediaStatus{font-size:12px;color:#999}.mediaTarget{width:100%;background:#09090a;color:#ddd;border:1px solid #2b2b2f;border-radius:10px;padding:8px}.mediaBadge{display:inline-flex;align-items:center;gap:5px;font-size:10px;padding:4px 7px;border-radius:999px;background:#ffffff0c;color:#aaa}.mediaRefresh.spin{opacity:.5;pointer-events:none}
`;
document.head.appendChild(style);

const pane=document.querySelector('[data-pane-view="media"]');
if(!pane) throw new Error('Nie znaleziono zakładki Pliki.');
const card=document.createElement('div');
card.className='adminCard mediaLibraryCard';
card.innerHTML=`
<div class="mediaLibraryHead"><div><h3 style="margin:0 0 4px">Biblioteka Firebase Storage</h3><div class="mediaStatus" id="mediaLibraryStatus">Ładowanie plików…</div></div><div class="mediaLibraryTools"><input id="mediaSearch" placeholder="Szukaj po nazwie…"><button class="pill active" data-mf="all">Wszystkie</button><button class="pill" data-mf="image">Zdjęcia</button><button class="pill" data-mf="video">Filmy</button><button class="pill mediaRefresh" id="mediaRefresh">Odśwież</button></div></div>
<div class="mediaLibraryGrid" id="mediaLibraryGrid"></div>`;
pane.appendChild(card);

const grid=card.querySelector('#mediaLibraryGrid');
const status=card.querySelector('#mediaLibraryStatus');
const refreshBtn=card.querySelector('#mediaRefresh');
const search=card.querySelector('#mediaSearch');

function fmtBytes(n=0){if(!n)return '0 B';const u=['B','KB','MB','GB'];let i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return `${n.toFixed(i?1:0)} ${u[i]}`}
function niceDate(s){try{return new Date(s).toLocaleString('pl-PL',{dateStyle:'short',timeStyle:'short'})}catch{return ''}}
function isVideo(m){return (m.contentType||'').startsWith('video/')||/\.(mp4|webm|mov)$/i.test(m.name)}
function isImage(m){return (m.contentType||'').startsWith('image/')||/\.(jpe?g|png|webp|gif|avif)$/i.test(m.name)}
function escapeHtml(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

async function getTargets(){
  try{
    const snap=await get(dbRef(db,'website/public'));
    const d=snap.val()||{};
    return [...(d.photos||[]).map(x=>({id:x.id,label:`FOTO — ${x.title}`})),...(d.films||[]).map(x=>({id:x.id,label:`FILM — ${x.title}`}))];
  }catch{return []}
}

async function assignToPortfolio(file,targetId){
  if(!targetId)return alert('Najpierw wybierz kafelek portfolio.');
  const snap=await get(dbRef(db,'website/public'));
  if(!snap.exists())return alert('Brak konfiguracji strony w Firebase.');
  const d=snap.val();
  let found=false;
  for(const key of ['photos','films']){
    if(!Array.isArray(d[key]))continue;
    const item=d[key].find(x=>x.id===targetId);
    if(item){item.image=file.url;found=true;break}
  }
  if(!found)return alert('Nie znaleziono wybranego kafelka.');
  await set(dbRef(db,'website/public'),d);
  alert('Zdjęcie zostało przypisane do portfolio ✓\n\nOdśwież zakładkę Portfolio albo podgląd strony.');
}

async function removeFile(file){
  if(!confirm(`Usunąć plik z Firebase Storage?\n\n${file.name}\n\nJeżeli jest używany w portfolio, obraz przestanie się wyświetlać.`))return;
  try{
    await deleteObject(sRef(storage,file.fullPath));
    files=files.filter(x=>x.fullPath!==file.fullPath);
    render();
    status.textContent=`${files.length} plików w Storage`;
  }catch(e){alert('Nie udało się usunąć pliku: '+e.message)}
}

async function render(){
  const targets=await getTargets();
  const q=query.toLowerCase().trim();
  const visible=files.filter(f=>(!q||f.name.toLowerCase().includes(q))&&(filter==='all'||(filter==='image'&&isImage(f))||(filter==='video'&&isVideo(f))));
  if(!visible.length){grid.innerHTML='<div class="mediaEmpty">Brak plików pasujących do filtra.</div>';return}
  grid.innerHTML='';
  for(const f of visible){
    const tile=document.createElement('div');tile.className='mediaTile';
    const preview=isImage(f)?`<img loading="lazy" src="${f.url}" alt="">`:isVideo(f)?`<video preload="metadata" muted src="${f.url}"></video>`:`<div class="mediaVideoIcon">FILE</div>`;
    const options=['<option value="">Przypisz do portfolio…</option>',...targets.map(t=>`<option value="${escapeHtml(t.id)}">${escapeHtml(t.label)}</option>`)].join('');
    tile.innerHTML=`<div class="mediaThumb">${preview}</div><div class="mediaBody"><div><span class="mediaBadge">${isVideo(f)?'FILM':isImage(f)?'ZDJĘCIE':'PLIK'}</span></div><div class="mediaName" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</div><div class="mediaMeta">${fmtBytes(f.size)} • ${niceDate(f.timeCreated)}</div>${isImage(f)?`<select class="mediaTarget">${options}</select>`:''}<div class="mediaActions"><a href="${f.url}" target="_blank">Otwórz</a><button data-copy>Kopiuj link</button>${isImage(f)?'<button data-assign>Użyj w portfolio</button>':''}<button class="danger" data-delete>Usuń</button></div></div>`;
    tile.querySelector('[data-copy]').onclick=async()=>{await navigator.clipboard.writeText(f.url);tile.querySelector('[data-copy]').textContent='Skopiowano ✓';setTimeout(()=>tile.querySelector('[data-copy]').textContent='Kopiuj link',1200)};
    if(isImage(f)) tile.querySelector('[data-assign]').onclick=()=>assignToPortfolio(f,tile.querySelector('.mediaTarget').value);
    tile.querySelector('[data-delete]').onclick=()=>removeFile(f);
    grid.appendChild(tile);
  }
}

async function loadLibrary(){
  refreshBtn.classList.add('spin');status.textContent='Wczytuję Firebase Storage…';
  try{
    const listed=await listAll(sRef(storage,'website/media'));
    const rows=await Promise.all(listed.items.map(async r=>{
      try{const [url,meta]=await Promise.all([getDownloadURL(r),getMetadata(r)]);return{name:r.name,fullPath:r.fullPath,url,size:meta.size||0,contentType:meta.contentType||'',timeCreated:meta.timeCreated||''}}catch{return null}
    }));
    files=rows.filter(Boolean).sort((a,b)=>new Date(b.timeCreated)-new Date(a.timeCreated));
    status.textContent=`${files.length} plików w Storage`;
    await render();
  }catch(e){status.textContent='Nie udało się wczytać biblioteki';grid.innerHTML=`<div class="mediaEmpty">${escapeHtml(e.message)}</div>`}
  finally{refreshBtn.classList.remove('spin')}
}

search.oninput=()=>{query=search.value;render()};
card.querySelectorAll('[data-mf]').forEach(b=>b.onclick=()=>{filter=b.dataset.mf;card.querySelectorAll('[data-mf]').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()});
refreshBtn.onclick=loadLibrary;

// Po zakończonym uploadzie admin.js dopisuje tekst ✓ Gotowe. Obserwator wtedy odświeża bibliotekę.
const uploadProgress=document.querySelector('#uploadProgress');
if(uploadProgress){let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{if(uploadProgress.textContent.includes('✓ Gotowe'))loadLibrary()},800)}).observe(uploadProgress,{subtree:true,childList:true,characterData:true})}

loadLibrary();

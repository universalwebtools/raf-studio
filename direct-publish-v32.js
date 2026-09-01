// RAF.studio — bezpieczna publikacja v3.2
// Omija niedozwolone website/history i publikuje wyłącznie pod website/public.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig, WEBSITE_ROOT } from "./firebase-config.js";

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const db=getDatabase(app);
const $=s=>document.querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function status(t){const e=$('#rafStatus3');if(e)e.textContent=t}
function flushInspector(){
  try{document.activeElement?.blur?.()}catch{}
  document.querySelectorAll('#rafPanel3 input,#rafPanel3 textarea,#rafPanel3 select').forEach(el=>{
    try{el.dispatchEvent(new Event('change',{bubbles:true}))}catch{}
  });
}

async function safePublish(){
  const b=$('#pub3');
  if(!b)return;
  b.disabled=true;b.textContent='PUBLIKOWANIE…';status('Zapisywanie zmian…');
  try{
    // Najpierw pozwalamy głównemu edytorowi zapisać aktualny draft po onchange.
    flushInspector();
    await sleep(2100);
    const snap=await get(ref(db,`${WEBSITE_ROOT}/public/editorDraft`));
    if(!snap.exists())throw new Error('Brak wersji roboczej do publikacji.');
    const d=snap.val()||{};

    // Każda część publikowana osobno — nic spoza website/public.
    const jobs=[];
    if(d.site!==undefined)jobs.push(set(ref(db,`${WEBSITE_ROOT}/public/site`),d.site||{}));
    if(d.homeContent!==undefined)jobs.push(set(ref(db,`${WEBSITE_ROOT}/public/homeContent`),d.homeContent||{}));
    if(d.homeMedia!==undefined)jobs.push(set(ref(db,`${WEBSITE_ROOT}/public/homeMedia`),d.homeMedia||{}));
    if(d.visualStyles!==undefined)jobs.push(set(ref(db,`${WEBSITE_ROOT}/public/visualStyles`),d.visualStyles||{}));
    if(d.builder!==undefined)jobs.push(set(ref(db,`${WEBSITE_ROOT}/public/builder`),d.builder||{}));
    await Promise.all(jobs);

    // Historia również pod public, więc obecne reguły Firebase ją dopuszczają.
    // Jej ewentualny błąd NIE może zablokować publikacji strony.
    const ts=Date.now();
    try{await set(ref(db,`${WEBSITE_ROOT}/public/editorHistory/${ts}`),{ts,data:d})}catch(e){console.warn('Historia nie zapisana, publikacja strony zakończona poprawnie:',e)}

    status('✓ Opublikowano');b.textContent='OPUBLIKOWANO ✓';
    setTimeout(()=>{b.textContent='OPUBLIKUJ';b.disabled=false},1400);
  }catch(e){
    console.error('RAF safe publish error',e);
    status('Błąd publikacji');b.textContent='OPUBLIKUJ';b.disabled=false;
    alert('Błąd publikacji: '+(e?.message||e));
  }
}

// Capture = przejmujemy klik zanim stary publish() spróbuje pisać do website/history.
document.addEventListener('click',e=>{
  const b=e.target.closest?.('#pub3');if(!b)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  safePublish();
},true);

// Historia v3.2 — czyta z dozwolonej ścieżki.
document.addEventListener('click',async e=>{
  const b=e.target.closest?.('#hist3');if(!b)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const modal=$('#rafModal3');if(!modal)return;
  modal.classList.add('open');modal.innerHTML='<button id="histClose32">✕ Zamknij</button><h2>Historia publikacji</h2><div id="histList32">Ładowanie…</div>';
  $('#histClose32').onclick=()=>modal.classList.remove('open');
  try{
    const s=await get(ref(db,`${WEBSITE_ROOT}/public/editorHistory`)),v=s.val()||{};
    const arr=Object.entries(v).map(([id,x])=>({id,...x})).sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,20);
    $('#histList32').innerHTML=arr.length?arr.map((h,i)=>`<div style="padding:9px;margin:6px 0;border:1px solid #ffffff22;border-radius:8px">${new Date(h.ts).toLocaleString('pl-PL')}</div>`).join(''):'Brak zapisanych wersji.';
  }catch(err){$('#histList32').textContent='Nie udało się wczytać historii: '+err.message}
},true);

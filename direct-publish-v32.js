// RAF.studio — bezpieczna publikacja v3.3
// Czeka na odtworzenie Firebase Auth, odświeża token i zapisuje wyłącznie pod website/public.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { firebaseConfig, WEBSITE_ROOT } from "./firebase-config.js";

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const db=getDatabase(app);
const auth=getAuth(app);
const $=s=>document.querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function status(t){const e=$('#rafStatus3');if(e)e.textContent=t}
function flushInspector(){
  try{document.activeElement?.blur?.()}catch{}
  document.querySelectorAll('#rafPanel3 input,#rafPanel3 textarea,#rafPanel3 select').forEach(el=>{
    try{el.dispatchEvent(new Event('change',{bubbles:true}))}catch{}
  });
}
function waitForUser(timeout=8000){
  if(auth.currentUser)return Promise.resolve(auth.currentUser);
  return new Promise((resolve,reject)=>{
    let done=false;
    const timer=setTimeout(()=>{if(done)return;done=true;unsub();reject(new Error('Sesja administratora nie jest aktywna. Zaloguj się ponownie.'))},timeout);
    const unsub=onAuthStateChanged(auth,user=>{
      if(done||!user)return;
      done=true;clearTimeout(timer);unsub();resolve(user);
    },err=>{if(done)return;done=true;clearTimeout(timer);unsub();reject(err)});
  });
}
async function authenticatedWrite(path,value){
  const user=await waitForUser();
  await user.getIdToken(true);
  await set(ref(db,path),value);
}

async function safePublish(){
  const b=$('#pub3');
  if(!b)return;
  b.disabled=true;b.textContent='PUBLIKOWANIE…';status('Sprawdzanie logowania…');
  try{
    const user=await waitForUser();
    status('Odświeżanie sesji…');
    await user.getIdToken(true);

    flushInspector();
    await sleep(1900);

    status('Wczytywanie wersji roboczej…');
    const snap=await get(ref(db,`${WEBSITE_ROOT}/public/editorDraft`));
    if(!snap.exists())throw new Error('Brak wersji roboczej do publikacji.');
    const d=snap.val()||{};

    // Najpierw wykonujemy mały test zapisu w tej samej dozwolonej gałęzi.
    const probePath=`${WEBSITE_ROOT}/public/editorPublishProbe`;
    await authenticatedWrite(probePath,{ts:Date.now(),uid:user.uid});

    status('Publikowanie strony…');
    const jobs=[];
    if(d.site!==undefined)jobs.push(authenticatedWrite(`${WEBSITE_ROOT}/public/site`,d.site||{}));
    if(d.homeContent!==undefined)jobs.push(authenticatedWrite(`${WEBSITE_ROOT}/public/homeContent`,d.homeContent||{}));
    if(d.homeMedia!==undefined)jobs.push(authenticatedWrite(`${WEBSITE_ROOT}/public/homeMedia`,d.homeMedia||{}));
    if(d.visualStyles!==undefined)jobs.push(authenticatedWrite(`${WEBSITE_ROOT}/public/visualStyles`,d.visualStyles||{}));
    if(d.builder!==undefined)jobs.push(authenticatedWrite(`${WEBSITE_ROOT}/public/builder`,d.builder||{}));
    await Promise.all(jobs);

    const ts=Date.now();
    try{await authenticatedWrite(`${WEBSITE_ROOT}/public/editorHistory/${ts}`,{ts,data:d})}
    catch(e){console.warn('Historia nie zapisana, ale strona została opublikowana:',e)}

    status('✓ Opublikowano');b.textContent='OPUBLIKOWANO ✓';
    setTimeout(()=>{b.textContent='OPUBLIKUJ';b.disabled=false},1500);
  }catch(e){
    console.error('RAF safe publish v3.3 error',e);
    status('Błąd publikacji');b.textContent='OPUBLIKUJ';b.disabled=false;
    const msg=e?.message||String(e);
    if(/permission_denied|permission denied/i.test(msg)){
      alert('Firebase nadal odrzuca zapis mimo aktywnego logowania. Oznacza to, że aktualne reguły Realtime Database nie pozwalają temu kontu zapisywać do website/public.\n\nSzczegóły: '+msg);
    }else alert('Błąd publikacji: '+msg);
  }
}

// Capture = przejmujemy klik zanim stary publish() spróbuje pisać do website/history.
document.addEventListener('click',e=>{
  const b=e.target.closest?.('#pub3');if(!b)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  safePublish();
},true);

// Historia czytana wyłącznie z website/public/editorHistory.
document.addEventListener('click',async e=>{
  const b=e.target.closest?.('#hist3');if(!b)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const modal=$('#rafModal3');if(!modal)return;
  modal.classList.add('open');modal.innerHTML='<button id="histClose32">✕ Zamknij</button><h2>Historia publikacji</h2><div id="histList32">Ładowanie…</div>';
  $('#histClose32').onclick=()=>modal.classList.remove('open');
  try{
    const user=await waitForUser();await user.getIdToken();
    const s=await get(ref(db,`${WEBSITE_ROOT}/public/editorHistory`)),v=s.val()||{};
    const arr=Object.entries(v).map(([id,x])=>({id,...x})).sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,20);
    $('#histList32').innerHTML=arr.length?arr.map(h=>`<div style="padding:9px;margin:6px 0;border:1px solid #ffffff22;border-radius:8px">${new Date(h.ts).toLocaleString('pl-PL')}</div>`).join(''):'Brak zapisanych wersji.';
  }catch(err){$('#histList32').textContent='Nie udało się wczytać historii: '+err.message}
},true);

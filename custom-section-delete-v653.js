// RAF.studio — persistent custom-section deletion v6.5.3
import { getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, set, remove, update } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
const db=getDatabase(getApp()),ROOT='website/public', $=(s,r=document)=>r.querySelector(s);
let busy=false;
const arr=v=>(Array.isArray(v)?v:Object.values(v||{})).filter(Boolean);
function selectedCustom(){
  const marked=$('.custom62-selected');
  const sec=marked?.closest?.('.raf-custom-section')||$('.raf-custom-section.rsel')||$('.raf-custom-section.custom62-selected');
  if(sec)return sec;
  const open=$('#rafPanel3');
  const tag=open?.querySelector?.('.c62tag')?.textContent||'';
  const m=tag.match(/WŁASNA SEKCJA\s*\/\s*([^/\s]+)/i);
  if(m)return document.querySelector(`.raf-custom-section[data-raf-section="${CSS.escape(m[1])}"]`);
  return null;
}
async function hardDelete(id){
  if(!id||busy)return;busy=true;
  const st=$('#rafStatus3');if(st)st.textContent='Usuwam sekcję…';
  try{
    const snap=await get(ref(db,`${ROOT}/editorDraft`)),d=snap.val()||{};
    d.builder||={};
    const before=arr(d.builder.customSections);
    d.builder.customSections=before.filter(x=>String(x?.id)!==String(id));
    d.builder.sectionOrder=arr(d.builder.sectionOrder).filter(x=>String(x)!==String(id));
    d.builder.clones=arr(d.builder.clones).filter(x=>String(x?.id)!==String(id)&&String(x?.sourceId)!==String(id)&&String(x?.sectionId)!==String(id));
    d.builder.deletedCustomSections={...(d.builder.deletedCustomSections||{}),[id]:Date.now()};
    if(d.visualStyles?.sections)delete d.visualStyles.sections[id];
    await set(ref(db,`${ROOT}/editorDraft`),d);
    // Defensive targeted deletes in case Firebase represented arrays as objects.
    await remove(ref(db,`${ROOT}/editorDraft/visualStyles/sections/${id}`)).catch(()=>{});
    // Also remove from the live DOM immediately.
    document.querySelectorAll(`.raf-custom-section[data-raf-section="${CSS.escape(id)}"]`).forEach(el=>el.remove());
    if(st)st.textContent='✓ Sekcja usunięta i zapisana';
    sessionStorage.setItem('rafDeletedSection653',String(id));
    setTimeout(()=>location.reload(),300);
  }catch(e){
    console.error('RAF custom delete v6.5.3',e);busy=false;
    if(st)st.textContent='Błąd usuwania sekcji';
    alert('Błąd usuwania sekcji: '+(e?.message||e));
  }
}
// Intercept the section delete before the legacy editor can only remove it visually.
document.addEventListener('click',e=>{
  const b=e.target.closest?.('#rafPanel3 button');
  if(!b)return;
  const label=(b.textContent||'').trim().toLowerCase();
  if(label!=='usuń'&&label!=='usun')return;
  const sec=selectedCustom();
  if(!sec)return;
  const id=sec.dataset.rafSection||sec.dataset.custom62Id;
  if(!id)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(confirm(`Usunąć całą sekcję „${id}”?`))hardDelete(id);
},true);

// Startup safety: tombstoned sections can never be resurrected by an older autosave copy.
(async()=>{
  try{
    const snap=await get(ref(db,`${ROOT}/editorDraft`)),d=snap.val()||{},dead=d.builder?.deletedCustomSections||{};
    const ids=new Set(Object.keys(dead));if(!ids.size)return;
    const old=arr(d.builder?.customSections),clean=old.filter(x=>!ids.has(String(x?.id)));
    const oldOrder=arr(d.builder?.sectionOrder),cleanOrder=oldOrder.filter(x=>!ids.has(String(x)));
    if(clean.length!==old.length||cleanOrder.length!==oldOrder.length){
      d.builder.customSections=clean;d.builder.sectionOrder=cleanOrder;
      await set(ref(db,`${ROOT}/editorDraft`),d);
    }
    for(const id of ids)document.querySelectorAll(`.raf-custom-section[data-raf-section="${CSS.escape(id)}"]`).forEach(el=>el.remove());
  }catch(e){console.warn('RAF delete tombstone guard',e)}
})();

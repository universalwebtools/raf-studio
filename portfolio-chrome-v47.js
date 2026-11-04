// RAF.studio — portfolio chrome aligned with the active editor release.
const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
const version=params.get('ev')||'8.9.3';

function versions(){
 const rows=Array.isArray(window.rafEditorReleases)?window.rafEditorReleases:[version];
 return [...new Set([version,...rows])]
}
function goVersion(next){
 if(typeof window.rafGoEditorVersion==='function'){window.rafGoEditorVersion(next);return}
 const u=new URL(location.href);u.searchParams.set('editor','direct');u.searchParams.set('ev',next);location.href=u
}
function init(){
 const top=$('.peTop');if(!top)return false;
 top.querySelector(':scope > b')?.remove();
 const status=$('#peStatus');if(status&&!/Zmiany|Opublik|Błąd/i.test(status.textContent))status.textContent=`✓ Edytor v${version}`;
 for(const id of ['peVersion47','peVersion54','peVersion55','peVersion60','peVersion61','peVersion62','peVersion893'])$('#'+id)?.remove();
 const wrap=document.createElement('label');wrap.id='peVersion893';wrap.style.cssText='display:flex;gap:5px;align-items:center;color:#aaa;font:10px system-ui';
 wrap.innerHTML=`<span>Wersja</span><select aria-label="Wersja edytora" style="background:#080809;color:#fff;border:1px solid #ffffff22;border-radius:8px;padding:6px">${versions().map((v,i)=>`<option value="${v}">${v}${i===0?' — najnowsza':''}</option>`).join('')}</select>`;
 top.insertBefore(wrap,$('#peAdd')||top.firstChild);
 const select=wrap.querySelector('select');select.value=version;select.onchange=()=>goVersion(select.value);
 return true
}
let tries=0;const timer=setInterval(()=>{if(init()||++tries>100)clearInterval(timer)},50);

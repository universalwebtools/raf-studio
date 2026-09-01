// RAF.studio — Editor Chrome v4.7
const $=(s,r=document)=>r.querySelector(s);
const params=new URLSearchParams(location.search);
const current=params.get('ev')||'4.7';
function clean(){const top=$('#rafTop3');if(!top)return false;
  const first=top.querySelector(':scope > b');if(first)first.remove();
  const st=$('#rafStatus3');if(st){st.textContent=`✓ Edytor v${current}`;st.title='Aktualna wersja edytora RAF.studio'}
  if(!$('#editorVersion47')){const wrap=document.createElement('label');wrap.id='editorVersion47';wrap.style.cssText='display:flex;align-items:center;gap:5px;color:#aaa;font:10px system-ui';wrap.innerHTML=`<span>Wersja</span><select id="editorVersionSelect47" style="background:#080809;color:#fff;border:1px solid #ffffff22;border-radius:8px;padding:6px"><option value="4.7">4.7 — najnowsza</option><option value="4.6">4.6</option><option value="4.5">4.5</option><option value="4.4">4.4</option></select>`;const add=$('#add3');top.insertBefore(wrap,add||top.firstChild);const sel=$('#editorVersionSelect47');sel.value=current;sel.onchange=()=>{const u=new URL(location.href);u.searchParams.set('editor','direct');u.searchParams.set('ev',sel.value);location.href=u.toString()}}
  const page=$('#pageSelect4');if(page&&!page.dataset.v47){page.dataset.v47='1';page.onchange=e=>{const u=new URL(e.target.value,location.href);u.searchParams.set('editor','direct');u.searchParams.set('ev',current);location.href=u.toString()}}
  const p=$('#rafPanel3');if(p&&!$('.rsel')&&!$('.extraSelected47')){p.innerHTML='';p.style.display='none'}
  return true}
function watchPanel(){const p=$('#rafPanel3');if(!p)return;new MutationObserver(()=>{const has=$('.rsel')||$('.extraSelected47');if(!has){p.innerHTML='';p.style.display='none'}else p.style.display='block'}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']})}
let n=0;const t=setInterval(()=>{n++;if(clean()){clearInterval(t);watchPanel()}else if(n>100)clearInterval(t)},50);
document.addEventListener('click',e=>{if(e.target.closest('#rafTop3,#rafPanel3,.rsel,.rafExtra47,.rbox3'))return;setTimeout(()=>{const p=$('#rafPanel3');if(p&&!$('.rsel')&&!$('.extraSelected47')){p.innerHTML='';p.style.display='none'}},0)},true);

// RAF.studio — detachable responsive editor panels v8.7.6
const toolbarHost=document.getElementById('popToolbarHost'),panelHost=document.getElementById('popPanelHost'),panelCard=document.getElementById('popPanelCard'),wait=document.getElementById('popWait');
let child=null,childWin=null,serial=0,editing=false,lastToolbar='',lastPanel='';
const interactive='button,input,select,textarea,a';
function openerFrame(){try{return window.opener?.document?.getElementById('frame')||null}catch{return null}}
function keyElements(root){[...root.querySelectorAll(interactive)].forEach((el,i)=>{if(!el.dataset.mobileBridgeKey)el.dataset.mobileBridgeKey=el.id?`id:${el.id}`:`pop:${i}:${++serial}`})}
function signature(root){if(!root)return'';return root.innerHTML+'|'+[...root.querySelectorAll('input,select,textarea')].map(x=>`${x.dataset.mobileBridgeKey}:${x.type==='checkbox'?x.checked:x.value}`).join('|')+'|'+root.style.display}
function sourceFor(target){const key=target?.closest?.('[data-mobile-bridge-key]')?.dataset.mobileBridgeKey;if(!key||!child)return null;return [...child.querySelectorAll('[data-mobile-bridge-key]')].find(x=>x.dataset.mobileBridgeKey===key)||null}
function cloneInto(source,host,kind){keyElements(source);const clone=source.cloneNode(true);clone.removeAttribute('style');clone.classList.add('popClone876',`pop${kind}876`);clone.querySelectorAll('[style]').forEach(el=>{if(/position\s*:\s*(fixed|absolute)/i.test(el.getAttribute('style')||'')){el.style.position='static';el.style.inset='auto';el.style.transform='none'}});const originals=[...source.querySelectorAll('input,select,textarea')],copies=[...clone.querySelectorAll('input,select,textarea')];copies.forEach((el,i)=>{el.value=originals[i]?.value??el.value;el.checked=!!originals[i]?.checked});host.replaceChildren(clone)}
function relayValue(e){const src=sourceFor(e.target);if(!src)return;if(src.type==='checkbox'||src.type==='radio')src.checked=e.target.checked;else src.value=e.target.value;src.dispatchEvent(new Event(e.type,{bubbles:true}))}
function relayClick(e){const target=e.target.closest?.(interactive),src=sourceFor(target);if(!src)return;if(src.matches('input,select,textarea'))return;e.preventDefault();src.click()}
for(const host of [toolbarHost,panelHost]){host.addEventListener('click',relayClick);host.addEventListener('input',relayValue);host.addEventListener('change',relayValue);host.addEventListener('focusin',()=>editing=true);host.addEventListener('focusout',()=>{editing=false;lastToolbar='';lastPanel=''})}
function history(redo=false){try{const f=openerFrame();childWin=f?.contentWindow;const fn=redo?childWin?.rafRedo72:childWin?.rafUndo72;if(typeof fn==='function'){fn();return true}childWin?.dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',ctrlKey:true,shiftKey:!!redo,bubbles:true,cancelable:true}));return true}catch(err){console.warn('RAF popout history',err);return false}}
window.addEventListener('keydown',e=>{const k=String(e.key||'').toLowerCase(),undo=(e.ctrlKey||e.metaKey)&&!e.altKey&&k==='z',redoY=(e.ctrlKey||e.metaKey)&&!e.altKey&&k==='y';if(!undo&&!redoY)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();history(redoY||e.shiftKey)},true);
document.getElementById('popUndo').onclick=()=>history(false);document.getElementById('popRedo').onclick=()=>history(true);document.getElementById('popDock').onclick=()=>{try{window.opener?.rafMobileDock876?.attach?.(true)}catch{}window.close()};
function connect(){try{
 const f=openerFrame();if(!f){wait.hidden=false;wait.textContent='Główne okno edytora jest zamknięte.';toolbarHost.replaceChildren();panelHost.replaceChildren();panelCard.hidden=true;return false}
 const next=f.contentDocument;if(!next?.body)return false;if(next!==child){child=next;childWin=f.contentWindow;lastToolbar='';lastPanel=''}
 const top=child.querySelector('#rafTop3'),panel=child.querySelector('#rafPanel3');if(!top)return false;wait.hidden=true;const ts=signature(top),ps=signature(panel);
 if(!editing&&ts!==lastToolbar){cloneInto(top,toolbarHost,'Toolbar');lastToolbar=ts}
 const panelOpen=!!panel&&child.defaultView.getComputedStyle(panel).display!=='none'&&panel.innerHTML.trim();panelCard.hidden=!panelOpen;if(panelOpen&&!editing&&ps!==lastPanel){cloneInto(panel,panelHost,'Panel');lastPanel=ps}if(!panelOpen){panelHost.replaceChildren();lastPanel=''}return true
 }catch(err){console.warn('RAF popout bridge',err);wait.hidden=false;wait.textContent='Ponawiam połączenie z edytorem…';return false}}
setInterval(connect,180);connect();
window.addEventListener('beforeunload',()=>{try{window.opener?.rafMobileDock876?.notifyClosed?.()}catch{}});

// RAF.studio — external responsive editor controls v8.7.6
// Mirrors the real editor toolbar/inspector outside the phone/tablet iframe and
// forwards global history shortcuts from the outer responsive workspace.
const bridgeFrame=document.getElementById('frame'),toolbarHost=document.getElementById('mobileToolbarHost'),panelHost=document.getElementById('mobilePanelHost'),panelCard=document.getElementById('mobilePanelCard'),wait=document.getElementById('mobileBridgeWait');
let child=null,childWin=null,serial=0,editing=false,lastToolbar='',lastPanel='';
const interactive='button,input,select,textarea,a';
function keyElements(root){[...root.querySelectorAll(interactive)].forEach((el,i)=>{if(!el.dataset.mobileBridgeKey)el.dataset.mobileBridgeKey=el.id?`id:${el.id}`:`auto:${i}:${++serial}`})}
function signature(root){if(!root)return'';return root.innerHTML+'|'+[...root.querySelectorAll('input,select,textarea')].map(x=>`${x.dataset.mobileBridgeKey}:${x.type==='checkbox'?x.checked:x.value}`).join('|')+'|'+root.style.display}
function sourceFor(target){const key=target?.closest?.('[data-mobile-bridge-key]')?.dataset.mobileBridgeKey;if(!key||!child)return null;return [...child.querySelectorAll('[data-mobile-bridge-key]')].find(x=>x.dataset.mobileBridgeKey===key)||null}
function cloneInto(source,host,kind){keyElements(source);const clone=source.cloneNode(true);clone.removeAttribute('style');clone.classList.add('mobileBridgeClone876',`mobileBridge${kind}876`);clone.querySelectorAll('[style]').forEach(el=>{if(/position\s*:\s*(fixed|absolute)/i.test(el.getAttribute('style')||'')){el.style.position='static';el.style.inset='auto';el.style.transform='none'}});const originals=[...source.querySelectorAll('input,select,textarea')],copies=[...clone.querySelectorAll('input,select,textarea')];copies.forEach((el,i)=>{el.value=originals[i]?.value??el.value;el.checked=!!originals[i]?.checked});host.replaceChildren(clone)}
function relayValue(e){const src=sourceFor(e.target);if(!src)return;if(src.type==='checkbox'||src.type==='radio')src.checked=e.target.checked;else src.value=e.target.value;src.dispatchEvent(new Event(e.type,{bubbles:true}))}
function relayClick(e){const target=e.target.closest?.(interactive),src=sourceFor(target);if(!src)return;if(src.matches('input,select,textarea'))return;e.preventDefault();src.click()}
for(const host of [toolbarHost,panelHost]){host.addEventListener('click',relayClick);host.addEventListener('input',relayValue);host.addEventListener('change',relayValue);host.addEventListener('focusin',()=>editing=true);host.addEventListener('focusout',()=>{editing=false;lastToolbar='';lastPanel=''})}
function history(redo=false){
 try{
  childWin=bridgeFrame.contentWindow;const fn=redo?childWin?.rafRedo72:childWin?.rafUndo72;
  if(typeof fn==='function'){fn();return true}
  childWin?.dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',ctrlKey:true,shiftKey:!!redo,bubbles:true,cancelable:true}));return true
 }catch(err){console.warn('RAF responsive history relay',err);return false}
}
window.addEventListener('keydown',e=>{
 const key=String(e.key||'').toLowerCase(),undo=(e.ctrlKey||e.metaKey)&&!e.altKey&&key==='z',redoY=(e.ctrlKey||e.metaKey)&&!e.altKey&&key==='y';
 if(!undo&&!redoY)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();history(redoY||e.shiftKey)
},true);
function connect(){try{
 const next=bridgeFrame.contentDocument;if(!next?.body)return false;if(next!==child){child=next;childWin=bridgeFrame.contentWindow;lastToolbar='';lastPanel=''}
 let style=child.getElementById('mobileBridgeHide876');if(!style){style=child.createElement('style');style.id='mobileBridgeHide876';style.textContent='#rafTop3,#rafPanel3{visibility:hidden!important;pointer-events:none!important}';child.head.appendChild(style)}
 const top=child.querySelector('#rafTop3'),panel=child.querySelector('#rafPanel3');if(!top)return false;if(wait)wait.hidden=true;const ts=signature(top),ps=signature(panel);
 if(!editing&&ts!==lastToolbar){cloneInto(top,toolbarHost,'Toolbar');lastToolbar=ts}
 const panelOpen=!!panel&&child.defaultView.getComputedStyle(panel).display!=='none'&&panel.innerHTML.trim();panelCard.hidden=!panelOpen;
 if(panelOpen&&!editing&&ps!==lastPanel){cloneInto(panel,panelHost,'Panel');lastPanel=ps}
 if(!panelOpen){panelHost.replaceChildren();lastPanel=''}return true
 }catch(err){console.warn('RAF mobile bridge',err);if(wait){wait.hidden=false;wait.textContent='Ponawiam połączenie z edytorem…'}return false}}
bridgeFrame.addEventListener('load',()=>{child=null;childWin=null;lastToolbar='';lastPanel='';if(wait){wait.hidden=false;wait.textContent='Łączenie z edytorem…'}setTimeout(connect,250)});
setInterval(connect,180);
window.rafMobileHistory876=history;

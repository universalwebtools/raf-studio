// RAF.studio — layers, clipboard, responsive controls and image crop UI v7.7.2
import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,set} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {getStorage,ref as sRef,uploadBytesResumable,getDownloadURL} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js';

const app=getApp(),db=getDatabase(app),storage=getStorage(app);
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let core=null,layers=null,menu=null,layerTimer=null,inspectorTimer=null,cropDrag=null,cropMode=false,augmenting=false;

function css(){
 if($('#workspace760css'))return;const s=document.createElement('style');s.id='workspace760css';
 s.textContent=
 '#v760devices{display:flex;gap:2px;padding:2px;border:1px solid #ffffff18;border-radius:9px;background:#050506}#v760devices button{padding:5px 7px!important;border:0!important;background:transparent!important;color:#999!important;font-size:10px!important}#v760devices button.active{background:#fff!important;color:#111!important}'+
 '#v760layers{position:fixed;left:8px;top:62px;bottom:8px;width:315px;z-index:1000032;background:#0d0d0fee;border:1px solid #ffffff22;border-radius:15px;color:#fff;display:none;grid-template-rows:auto auto minmax(0,1fr);font:12px system-ui;backdrop-filter:blur(22px);box-shadow:0 20px 70px #000a;overflow:hidden}#v760layers.open{display:grid}'+
 '.v760layersHead{display:flex;justify-content:space-between;align-items:center;padding:13px;border-bottom:1px solid #ffffff15}.v760layersHead b{font-size:15px}.v760layersHead button{border:1px solid #ffffff20;background:#171719;color:#fff;border-radius:8px;padding:6px 9px;cursor:pointer}'+
 '#v760layerSearch{margin:10px 12px;width:calc(100% - 24px);box-sizing:border-box;background:#070708;color:#fff;border:1px solid #343438;border-radius:9px;padding:9px}#v760layerList{overflow:auto;padding:0 8px 12px;scrollbar-color:#555 #111}'+
 '.v760section{margin:7px 0 3px;padding:8px 7px 5px;color:#70caff;font-size:9px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;border-top:1px solid #ffffff12}'+
 '.v760layer{display:grid;grid-template-columns:minmax(0,1fr) 27px 27px 27px;gap:3px;align-items:center;border:1px solid transparent;border-radius:8px;margin:2px 0;padding:3px;background:#ffffff04;cursor:pointer}.v760layer:hover{background:#ffffff0a}.v760layer.active{border-color:#22a8ff;background:#168ee622}.v760layer.hidden{opacity:.48}.v760layer.locked .v760layerName:before{content:"🔒 ";font-size:9px}.v760layerName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:5px 3px}.v760layerTag{color:#777;font-size:8px;text-transform:uppercase;margin-right:5px}.v760layer button{border:0;background:transparent;color:#aaa;padding:4px;cursor:pointer}.v760layer button:hover{color:#fff;background:#ffffff10;border-radius:5px}'+
 '.v760layer.deleted{grid-template-columns:minmax(0,1fr) 86px;opacity:.7;border-color:#ff4e6822}.v760restore{color:#76e6ac!important}.v760danger{border-color:#ff4e68!important;color:#ff9bac!important;background:#210b11!important}.v760trashHead{color:#ff8ca0!important}.v760toast{position:fixed;left:50%;bottom:24px;translate:-50% 0;z-index:1000099;display:flex;align-items:center;gap:12px;padding:11px 13px;border:1px solid #ffffff24;border-radius:12px;background:#101012f2;color:#fff;box-shadow:0 18px 55px #000b;font:12px system-ui}.v760toast button{border:1px solid #55cfff;background:#092133;color:#9bddff;border-radius:8px;padding:7px 10px;cursor:pointer}'+
 '#v760menu{position:fixed;z-index:1000070;width:220px;background:#101012f5;border:1px solid #ffffff24;border-radius:12px;padding:7px;box-shadow:0 22px 70px #000c;color:#fff;font:12px system-ui;display:none;backdrop-filter:blur(20px)}#v760menu.open{display:block}#v760menu button{display:flex;justify-content:space-between;width:100%;border:0;background:transparent;color:#eee;padding:8px 9px;border-radius:7px;cursor:pointer;text-align:left}#v760menu button:hover{background:#ffffff12}#v760menu hr{border:0;border-top:1px solid #ffffff13;margin:5px 0}#v760menu small{color:#777}'+
 '#rafPanel3 #v760common{border:1px solid #22a8ff44;background:#07131b;margin:0 0 12px;padding:11px;border-radius:11px}#v760common .v760title{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px}#v760common .v760title small{color:#70caff;font-weight:900;letter-spacing:.12em}#v760common .v760grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}#v760common label{margin:5px 0 2px!important}#v760common input,#v760common select,#v760common textarea{box-sizing:border-box;padding:7px!important}#v760common textarea{min-height:86px;resize:vertical}#v760common .v760actions{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px}#v760common .v760actions button{padding:7px 4px!important;font-size:10px}'+
 '.v760crop{border-top:1px solid #ffffff13;margin-top:10px;padding-top:9px}.v760crop b{font-size:11px}.v760rangeLine{display:grid;grid-template-columns:42px 1fr 38px;gap:5px;align-items:center}.v760rangeLine input{padding:0!important}.v760rangeLine output{text-align:right;color:#aaa;font-size:9px}.v760cropActive{outline:2px dashed #ff3aa6!important;outline-offset:-3px;cursor:grab!important}'+
 '@media(max-width:700px){#v760layers{left:4px;right:4px;top:58px;bottom:4px;width:auto}#v760devices{display:none}}';
 document.head.appendChild(s)
}
function status(t){const e=$('#rafStatus3');if(e)e.textContent=t}
function currentDevice(){return new URLSearchParams(location.search).get('device')||'desktop'}
function topUI(){
 const top=$('#rafTop3');if(!top)return false;$('#mobileEditorBtn73')?.remove();
 if(!$('#layersBtn760')){const b=document.createElement('button');b.id='layersBtn760';b.textContent='☷ WARSTWY';b.onclick=()=>toggleLayers();top.insertBefore(b,$('#templatesBtn752')||$('#proBtn61')||$('#add3')||top.firstChild)}
 if(!new URLSearchParams(location.search).has('embedded')&&!$('#v760devices')){
  const d=document.createElement('div');d.id='v760devices';d.innerHTML='<button data-device="desktop">🖥 PC</button><button data-device="tablet">▰ Tablet</button><button data-device="mobile">▯ Telefon</button>';
  $$('button',d).forEach(b=>{b.classList.toggle('active',b.dataset.device===currentDevice());b.onclick=()=>{const mode=b.dataset.device;if(mode==='desktop')location.href='edytorstrony.html';else location.href='mobile-editor.html?device='+mode}});
  top.insertBefore(d,$('#preview3')||$('#exit3')||top.lastChild)
 }
 return true
}
function layerPanel(){
 if(layers)return layers;layers=document.createElement('aside');layers.id='v760layers';
 layers.innerHTML='<div class="v760layersHead"><div><b>WARSTWY</b><div style="font-size:9px;color:#777">Kliknij, ukryj, zablokuj lub przesuń</div></div><button id="v760layersClose">✕</button></div><input id="v760layerSearch" placeholder="Szukaj elementu…"><div id="v760layerList"></div>';
 document.body.appendChild(layers);$('#v760layersClose').onclick=()=>toggleLayers(false);$('#v760layerSearch').oninput=renderLayers;return layers
}
function toggleLayers(force){const p=layerPanel(),on=force??!p.classList.contains('open');p.classList.toggle('open',on);if(on)renderLayers()}
function sectionName(id){return String(id||'STRONA').replace(/^section:/,'').replace(/^e752:[^:]+:/,'SEKCJA ')}
function depth(el){let n=el,d=0;while(n&&d<5){n=n.parentElement;if(!n||n.matches('[data-raf-section],header.hero'))break;d++}return d}
function scheduleLayers(){clearTimeout(layerTimer);layerTimer=setTimeout(()=>{if(layers?.classList.contains('open'))renderLayers()},90)}
function renderLayers(){
 if(!core)return;const list=core.list(),chosen=new Set(core.selected().map(core.id)),q=($('#v760layerSearch')?.value||'').toLowerCase(),box=$('#v760layerList');if(!box)return;
 const match=x=>!q||(x.label+' '+x.id+' '+x.tag).toLowerCase().includes(q),active=list.filter(x=>!x.cfg.deleted&&match(x)),trash=list.filter(x=>x.cfg.deleted&&match(x)),groups=new Map();for(const x of active){if(!groups.has(x.sectionId))groups.set(x.sectionId,[]);groups.get(x.sectionId).push(x)}
 let html='';
 for(const [sec,rows] of groups){html+='<div class="v760section">'+esc(sectionName(sec))+'</div>';
  for(const x of rows){const c=x.cfg,indent=Math.min(4,depth(x.el))*11;html+='<div class="v760layer '+(chosen.has(x.id)?'active ':'')+(c.hidden?'hidden ':'')+(c.locked?'locked ':'')+'" draggable="true" data-layer-id="'+esc(x.id)+'"><div class="v760layerName" style="padding-left:'+(4+indent)+'px"><span class="v760layerTag">'+esc(x.tag)+'</span>'+esc(x.label||x.id)+'</div><button data-act="rename" title="Zmień nazwę">✎</button><button data-act="hide" title="Ukryj / pokaż">'+(c.hidden?'◌':'◉')+'</button><button data-act="lock" title="Zablokuj / odblokuj">'+(c.locked?'🔒':'🔓')+'</button></div>'}
 }
 if(trash.length){html+='<div class="v760section v760trashHead">KOSZ • '+trash.length+'</div>';for(const x of trash)html+='<div class="v760layer deleted" data-layer-id="'+esc(x.id)+'"><div class="v760layerName"><span class="v760layerTag">'+esc(x.tag)+'</span>'+esc(x.label||x.id)+'</div><button class="v760restore" data-act="restore">↶ Przywróć</button></div>'}
 box.innerHTML=html||'<div style="padding:18px;color:#777">Brak pasujących warstw.</div>';let dragging='';
 $$('.v760layer',box).forEach(row=>{
  const id=row.dataset.layerId;row.onclick=e=>{const act=e.target.closest('button')?.dataset.act;if(act){e.stopPropagation();const item=core.list().find(x=>x.id===id);if(!item)return;if(act==='restore'){core.restoreDeleted(item.el);status('✓ Element przywrócony z Kosza')}if(act==='hide')core.patchOne(item.el,{hidden:!item.cfg.hidden});if(act==='lock')core.patchOne(item.el,{locked:!item.cfg.locked});if(act==='rename'){const name=prompt('Nazwa warstwy:',item.cfg.label||item.label);if(name!==null){core.selectElement(item.el);core.rename(name)}}scheduleLayers();return}if(!row.classList.contains('deleted'))core.selectById(id);scheduleLayers()};
  row.ondragstart=()=>dragging=id;row.ondragover=e=>e.preventDefault();row.ondrop=e=>{e.preventDefault();if(!dragging||dragging===id)return;const all=core.list(),a=all.find(x=>x.id===dragging),b=all.find(x=>x.id===id);if(a&&b){core.patchOne(a.el,{z:(Number(b.cfg.z)||0)+1});status('✓ Zmieniono kolejność warstwy')}dragging='';scheduleLayers()}
 })
}

function contextMenu(){
 if(menu)return menu;menu=document.createElement('div');menu.id='v760menu';
 menu.innerHTML='<button data-c="copy">Kopiuj <small>Ctrl+C</small></button><button data-c="paste">Wklej <small>Ctrl+V</small></button><button data-c="duplicate">Duplikuj <small>Ctrl+D</small></button><hr><button data-c="copyStyle">Kopiuj wygląd</button><button data-c="pasteStyle">Wklej wygląd</button><hr><button data-c="front">Na samą górę</button><button data-c="back">Na sam dół</button><button data-c="hide">Ukryj / pokaż</button><button data-c="lock">Zablokuj / odblokuj</button><button data-c="reset">Reset pozycji i rozmiaru</button><hr><button class="v760danger" data-c="delete">Przenieś do Kosza <small>Delete</small></button>';
 document.body.appendChild(menu);menu.onclick=e=>{const c=e.target.closest('button')?.dataset.c;if(!c)return;runAction(c);hideMenu()};return menu
}
function showMenu(x,y){const m=contextMenu();m.classList.add('open');m.style.left=Math.min(innerWidth-230,x)+'px';m.style.top=Math.min(innerHeight-390,y)+'px'}
function hideMenu(){menu?.classList.remove('open')}
function runAction(c){
 if(!core)return;
 if(c==='copy'){core.copy();status('✓ Skopiowano element')}
 if(c==='paste'){core.paste();status('✓ Wklejono element')}
 if(c==='duplicate'){const wid=single()?.closest?.('[data-raf-widget-id]')?.dataset.rafWidgetId;if(wid&&window.rafWidgets770?.duplicate)window.rafWidgets770.duplicate(wid);else core.duplicate();status('✓ Utworzono duplikat')}
 if(c==='copyStyle'){core.copyStyle();status('✓ Skopiowano wygląd')}
 if(c==='pasteStyle'){core.pasteStyle();status('✓ Wklejono wygląd')}
 if(c==='front')core.front();if(c==='back')core.back();if(c==='hide')core.toggleHidden();if(c==='lock')core.toggleLocked();if(c==='reset')core.resetTransform();
 if(c==='delete')core.deleteSelected();
 scheduleLayers();scheduleInspector(true)
}

function single(){return core?.selected()?.length===1?core.selected()[0]:null}
function editableText(el){return!!el?.matches?.('h1,h2,h3,h4,h5,h6,p,span,b,strong,small,blockquote,a,button,label')&&!el.querySelector('img,video,svg,iframe,input,textarea,select')}
function toast(message){$('.v760toast')?.remove();const t=document.createElement('div');t.className='v760toast';t.innerHTML='<span>'+esc(message)+'</span><button>↶ Cofnij</button>';document.body.appendChild(t);$('button',t).onclick=()=>{core.undo();t.remove();status('✓ Usuwanie cofnięte')};setTimeout(()=>t.remove(),6500)}
function inspectorHtml(el){
 const c=core.cfgFor(el),r=el.getBoundingClientRect(),w=Math.round(Number(c.width)||r.width),h=Math.round(Number(c.height)||r.height),isImg=el instanceof HTMLImageElement,crop={x:50,y:50,zoom:1,fit:'cover',...(c.crop||{})};
 let html='<div class="v760title"><small>EDYCJA ELEMENTU • 8.3</small><span>'+esc(core.id(el))+'</span></div>'+(editableText(el)?'<label>Treść<textarea id="v760text">'+esc(c.text??el.textContent??'')+'</textarea></label>':'')+(el instanceof HTMLAnchorElement?'<label>Link<input id="v760href" value="'+esc(c.href??el.getAttribute('href')??'')+'"></label>':'')+'<div class="v760grid"><label>X<input id="v760x" type="number" value="'+Math.round(Number(c.x)||0)+'"></label><label>Y<input id="v760y" type="number" value="'+Math.round(Number(c.y)||0)+'"></label><label>Szerokość<input id="v760w" type="number" min="24" value="'+w+'"></label><label>Wysokość<input id="v760h" type="number" min="24" value="'+h+'"></label><label>Obrót °<input id="v760rot" type="number" value="'+Math.round(Number(c.rotate)||0)+'"></label><label style="display:flex;align-items:center;gap:6px;padding-top:17px"><input id="v760ratio" type="checkbox" style="width:auto" checked> Proporcje</label></div><div class="v760actions"><button data-v760="duplicate">Duplikuj</button><button data-v760="front">Na górę</button><button data-v760="back">Na dół</button><button data-v760="hide">'+(c.hidden?'Pokaż':'Ukryj')+'</button><button data-v760="lock">'+(c.locked?'Odblokuj':'Zablokuj')+'</button><button data-v760="reset">Reset</button><button class="v760danger" style="grid-column:1/-1" data-v760="delete">⌫ USUŃ ZAZNACZENIE</button></div>';
 if(isImg)html+='<div class="v760crop"><div style="display:flex;justify-content:space-between;align-items:center"><b>KADROWANIE ZDJĘCIA</b><button id="v760cropDrag">'+(cropMode?'✓ Zakończ':'✥ Kadruj myszką')+'</button></div><label>Dopasowanie<select id="v760fit"><option value="cover">Wypełnij / cover</option><option value="contain">Pokaż całe / contain</option></select></label><div class="v760rangeLine"><span>X</span><input id="v760cropX" type="range" min="0" max="100" value="'+crop.x+'"><output id="v760cropXo">'+Math.round(crop.x)+'%</output></div><div class="v760rangeLine"><span>Y</span><input id="v760cropY" type="range" min="0" max="100" value="'+crop.y+'"><output id="v760cropYo">'+Math.round(crop.y)+'%</output></div><div class="v760rangeLine"><span>Zoom</span><input id="v760zoom" type="range" min="0.5" max="4" step=".01" value="'+crop.zoom+'"><output id="v760zo">'+Number(crop.zoom).toFixed(2)+'×</output></div><div class="v760actions"><button id="v760replace">Zamień zdjęcie</button><button id="v760cropReset">Reset kadru</button></div><input id="v760file" type="file" accept="image/*" hidden><div id="v760upload" style="font-size:9px;color:#888;margin-top:5px"></div></div>';
 return html
}
function scheduleInspector(force=false){clearTimeout(inspectorTimer);inspectorTimer=setTimeout(()=>renderInspector(force),0)}
function syncInspector(el){
 const box=$('#v760common');if(!box||box.dataset.id!==core.id(el))return false;const c=core.cfgFor(el),r=el.getBoundingClientRect();
 const vals={v760x:Math.round(Number(c.x)||0),v760y:Math.round(Number(c.y)||0),v760w:Math.round(Number(c.width)||r.width),v760h:Math.round(Number(c.height)||r.height),v760rot:Math.round(Number(c.rotate)||0)};
 for(const [id,v] of Object.entries(vals)){const x=$('#'+id,box);if(x&&document.activeElement!==x)x.value=v}return true
}
function renderInspector(force=false){
 if(!core||augmenting)return;const el=single(),p=$('#rafPanel3');if(!el||!p){$('#v760common')?.remove();return}
 if(!force&&syncInspector(el))return;augmenting=true;
 try{
  $('#v760common')?.remove();const box=document.createElement('section');box.id='v760common';box.dataset.id=core.id(el);box.innerHTML=inspectorHtml(el);p.prepend(box);
  const startAspect=(Number(core.cfgFor(el).width)||el.getBoundingClientRect().width)/Math.max(1,Number(core.cfgFor(el).height)||el.getBoundingClientRect().height);
  const patch=()=>{const out={x:Number($('#v760x').value)||0,y:Number($('#v760y').value)||0,width:Math.max(24,Number($('#v760w').value)||24),height:Math.max(24,Number($('#v760h').value)||24),rotate:Number($('#v760rot').value)||0};core.patchOne(el,out)};
  for(const id of ['v760x','v760y','v760rot'])$('#'+id)?.addEventListener('change',patch);
  $('#v760w')?.addEventListener('change',()=>{if($('#v760ratio').checked)$('#v760h').value=Math.round(Number($('#v760w').value)/startAspect);patch()});
  $('#v760h')?.addEventListener('change',()=>{if($('#v760ratio').checked)$('#v760w').value=Math.round(Number($('#v760h').value)*startAspect);patch()});
  const text=$('#v760text',box),href=$('#v760href',box);let contentPushed=false;const pushContent=()=>{if(!contentPushed){core.checkpoint();contentPushed=true}};if(text){text.addEventListener('focus',pushContent,{once:true});text.addEventListener('input',()=>{pushContent();core.patchOne(el,{text:text.value},{commitNow:false})})}if(href){href.addEventListener('focus',pushContent,{once:true});href.addEventListener('input',()=>{pushContent();core.patchOne(el,{href:href.value},{commitNow:false})})}
  $$('[data-v760]',box).forEach(b=>b.onclick=()=>runAction(b.dataset.v760));
  if(el instanceof HTMLImageElement)wireCrop(el,box)
 }finally{augmenting=false}
}
function cropValue(box){return{x:Number($('#v760cropX',box).value),y:Number($('#v760cropY',box).value),zoom:Number($('#v760zoom',box).value),fit:$('#v760fit',box).value}}
function wireCrop(el,box){
 const c=core.cfgFor(el),crop={x:50,y:50,zoom:1,fit:'cover',...(c.crop||{})};$('#v760fit',box).value=crop.fit;
 let pushed=false;const push=()=>{if(!pushed){core.checkpoint();pushed=true}};
 const live=()=>{push();const v=cropValue(box);core.patchOne(el,{crop:v},{commitNow:false});$('#v760cropXo',box).value=Math.round(v.x)+'%';$('#v760cropYo',box).value=Math.round(v.y)+'%';$('#v760zo',box).value=v.zoom.toFixed(2)+'×'};
 for(const id of ['v760cropX','v760cropY','v760zoom'])$('#'+id,box).addEventListener('input',live);$('#v760fit',box).addEventListener('change',live);
 $('#v760cropDrag',box).onclick=()=>{cropMode=!cropMode;document.body.classList.toggle('raf-crop-active',cropMode);el.classList.toggle('v760cropActive',cropMode);$('#v760cropDrag',box).textContent=cropMode?'✓ Zakończ':'✥ Kadruj myszką'};
 $('#v760cropReset',box).onclick=()=>{core.patchOne(el,{crop:{x:50,y:50,zoom:1,fit:'cover'}});scheduleInspector(true)};
 $('#v760replace',box).onclick=()=>$('#v760file',box).click();
 $('#v760file',box).onchange=async()=>{let f=$('#v760file',box).files?.[0];if(!f)return;try{f=await window.rafOptimizeImageFile?.(f)||f}catch{}const name=f.name.replace(/[^a-zA-Z0-9._-]+/g,'_'),task=uploadBytesResumable(sRef(storage,'website/media/'+Date.now()+'_'+name),f,{contentType:f.type||'image/webp'});task.on('state_changed',s=>$('#v760upload',box).textContent='Wysyłanie… '+Math.round(s.bytesTransferred/s.totalBytes*100)+'%',e=>$('#v760upload',box).textContent='Błąd: '+e.message,async()=>{const url=await getDownloadURL(task.snapshot.ref);core.patchOne(el,{src:url});if(el.dataset.homeMedia)await set(ref(db,'website/public/editorDraft/homeMedia/'+el.dataset.homeMedia+'/url'),url);$('#v760upload',box).textContent='✓ Zdjęcie podmienione'})}
}
function cropStart(e){
 if(!cropMode||!core)return;const el=single();if(!(el instanceof HTMLImageElement)||!e.target.closest('img')||e.target!==el)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const c=core.cfgFor(el),crop={x:50,y:50,zoom:1,fit:'cover',...(c.crop||{})};core.checkpoint();cropDrag={pid:e.pointerId,el,sx:e.clientX,sy:e.clientY,x:Number(crop.x),y:Number(crop.y),r:el.getBoundingClientRect(),crop};try{el.setPointerCapture(e.pointerId)}catch{}
}
function cropMove(e){if(!cropDrag||e.pointerId!==cropDrag.pid)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const d=cropDrag,x=clamp(d.x-(e.clientX-d.sx)/Math.max(1,d.r.width)*100,0,100),y=clamp(d.y-(e.clientY-d.sy)/Math.max(1,d.r.height)*100,0,100);d.crop={...d.crop,x,y};core.patchOne(d.el,{crop:d.crop},{commitNow:false});const box=$('#v760common');if(box){$('#v760cropX',box).value=x;$('#v760cropY',box).value=y;$('#v760cropXo',box).value=Math.round(x)+'%';$('#v760cropYo',box).value=Math.round(y)+'%'}}
function cropEnd(e){if(!cropDrag||e.pointerId!==cropDrag.pid)return;cropDrag=null;core.save();scheduleInspector(false)}

function installEvents(){
 document.addEventListener('contextmenu',e=>{if(e.target.closest('#rafTop3,#rafPanel3,#v760layers,#v760menu,#v760history,#widgetsModal770'))return;const el=e.target.closest('[data-raf-v72-id]');if(!el)return;e.preventDefault();if(!core.selected().includes(el))core.selectElement(el);showMenu(e.clientX,e.clientY)},true);
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('#v760menu'))hideMenu();cropStart(e)},true);
 document.addEventListener('pointermove',cropMove,true);document.addEventListener('pointerup',cropEnd,true);document.addEventListener('pointercancel',cropEnd,true);addEventListener('scroll',hideMenu,{passive:true});
 document.addEventListener('keydown',e=>{if(e.target.closest?.('input,textarea,select,[contenteditable="true"]')||!(e.ctrlKey||e.metaKey)||e.altKey)return;const k=e.key.toLowerCase();if(!['c','v','d'].includes(k))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(k==='c'&&e.shiftKey)runAction('copyStyle');else if(k==='v'&&e.shiftKey)runAction('pasteStyle');else if(k==='c')runAction('copy');else if(k==='v')runAction('paste');else runAction('duplicate')},true);
 window.addEventListener('raf:v760-selection',()=>{scheduleInspector(true);scheduleLayers()});window.addEventListener('raf:v760-change',()=>{scheduleInspector(false);scheduleLayers()});window.addEventListener('raf:v760-layers',scheduleLayers)
 window.addEventListener('raf:v760-edit',()=>{scheduleInspector(true);setTimeout(()=>{$('#v760text,#v760href,#v760x')?.focus();$('#rafPanel3')?.scrollTo({top:0,behavior:'smooth'})},20)});window.addEventListener('raf:v760-deleted',e=>{toast(e.detail?.count===1?'Element przeniesiony do Kosza':(e.detail?.count||0)+' elementy przeniesione do Kosza');scheduleLayers()})
}
async function init(){
 css();for(let i=0;i<100&&!window.rafCore760;i++)await new Promise(r=>setTimeout(r,50));core=window.rafCore760;if(!core)throw new Error('Brak rdzenia edytora 7.7');
 let n=0,t=setInterval(()=>{if(topUI()||++n>120)clearInterval(t)},50);layerPanel();contextMenu();installEvents();new MutationObserver(()=>{if(!augmenting)scheduleInspector(false)}).observe($('#rafPanel3')||document.body,{childList:true,subtree:true});core.refresh();scheduleInspector(true)
}
init().catch(e=>console.error('RAF workspace 7.7',e));

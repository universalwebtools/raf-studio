// RAF.studio — portfolio data bridge for the complete visual editor v8.9.3
import {registerNavigationSave} from './editor-interactions-v893.js?v=893-click-1';
import {getApps,getApp,initializeApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,set} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {firebaseConfig,WEBSITE_ROOT} from './firebase-config.js';

const app=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(app);
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clone=x=>structuredClone(x??[]),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isFilm=/\/film(?:\.html|\/)?$/i.test(location.pathname),type=isFilm?'film':'photo',key=isFilm?'films':'photos';
const gridSelector=isFilm?'#filmGrid':'#photoGrid';
let items=[],selectedId='',dirty=false,saveTimer=null,saveChain=Promise.resolve();

function device(){return new URLSearchParams(location.search).get('device')||(innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop')}
function defaultsCfg(d=device()){return{span:d==='mobile'?12:6,ratio:isFilm?'16/9':'4/3',x:50,y:50}}
function cfg(item,d=device()){return{...defaultsCfg(d),...(item?.[d]||item?.desktop||{})}}
function stable(item,suffix=''){return`portfolio:${type}:${item.id}${suffix?':'+suffix:''}`}
function status(message){const el=$('#rafStatus3');if(el)el.textContent=message||(dirty?'● Zmiany robocze':'✓ Wersja robocza zapisana')}
function normalize(value){if(Array.isArray(value))return value.filter(Boolean);if(value&&typeof value==='object')return Object.values(value).filter(Boolean);return[]}

function deriveFromDom(){return $$('.portfolioCard[data-id]',$(gridSelector)||document).map(card=>({
 id:card.dataset.id,title:$('.cap b',card)?.textContent?.trim()||'Kafelek',category:$('.cap small',card)?.textContent?.trim()||'',
 image:$('img',card)?.getAttribute('src')||'',video:'',visible:true,
 desktop:{...defaultsCfg('desktop'),span:Number(getComputedStyle(card).getPropertyValue('--span'))||6,ratio:card.style.aspectRatio||defaultsCfg('desktop').ratio},
 tablet:defaultsCfg('tablet'),mobile:defaultsCfg('mobile')
}))}

function cardFor(item){
 const d=cfg(item),card=document.createElement('article'),base=stable(item);
 card.className='portfolioCard reveal in';if(item.visible===false)card.classList.add('portfolioHidden893');
 card.style.setProperty('--span',d.span||12);card.style.aspectRatio=d.ratio||defaultsCfg().ratio;
 card.dataset.id=item.id;card.dataset.type=type;card.dataset.rafFree='1';card.dataset.rafV7Id=base;
 card.innerHTML=`<img data-raf-free="1" data-raf-v7-id="${esc(base)}:image" src="${esc(item.image||'')}" alt="${esc(item.title||'')}"><div class="shade"></div><div class="cap"><small data-raf-free="1" data-raf-v7-id="${esc(base)}:category">${esc(item.category||'')}</small><b data-raf-free="1" data-raf-v7-id="${esc(base)}:title">${esc(item.title||'Bez tytułu')}</b>${isFilm?`<span class="play" data-raf-free="1" data-raf-v7-id="${esc(base)}:play">▶</span>`:''}</div>`;
 const image=$('img',card);image.style.objectPosition=`${d.x??50}% ${d.y??50}%`;
 return card
}

function renderGrid(selectAfter=''){
 const grid=$(gridSelector);if(!grid)return;grid.innerHTML='';items.forEach(item=>grid.appendChild(cardFor(item)));
 const finish=()=>{const core=window.rafCore760;core?.refresh?.();if(selectAfter)core?.selectById?.(stable(items.find(x=>x.id===selectAfter)||{id:selectAfter}))};
 requestAnimationFrame(()=>setTimeout(finish,30))
}

function saveDraft(){
 clearTimeout(saveTimer);const payload=clone(items);saveChain=saveChain.catch(()=>{}).then(()=>set(ref(db,`${WEBSITE_ROOT}/public/editorPortfolioDraft/${key}`),payload)).then(()=>{dirty=false;status('✓ Wersja robocza zapisana')});return saveChain
}
function markDirty(){dirty=true;status();clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveDraft().catch(e=>status('Błąd zapisu kafelków: '+e.message)),900)}
registerNavigationSave(async()=>{clearTimeout(saveTimer);if(dirty)await saveDraft()});

function itemAndCard(){
 const el=window.rafCore760?.selected?.()?.[0],card=el?.matches?.('.portfolioCard[data-id]')?el:el?.closest?.('.portfolioCard[data-id]');
 if(!card)return{};return{item:items.find(x=>String(x.id)===String(card.dataset.id)),card,el}
}
function patchElement(el,patch){if(el&&window.rafCore760)window.rafCore760.patchOne(el,patch)}
function beginChange(){window.rafCore760?.checkpoint?.()}

function tilePanelHtml(item){
 return `<div class="portfolioTileTitle893"><small>DANE KAFELKA • ${isFilm?'FILM':'FOTOGRAFIA'}</small><b>${esc(item.title||'Kafelek')}</b></div>
 <label>Tytuł kafelka<input id="portfolioTitle893" value="${esc(item.title||'')}"></label>
 <label>Kategoria<input id="portfolioCategory893" value="${esc(item.category||'')}"></label>
 <label>Zdjęcie / URL<input id="portfolioImage893" value="${esc(item.image||'')}"></label>
 ${isFilm?`<label>Film URL<input id="portfolioVideo893" value="${esc(item.video||'')}" placeholder="YouTube / Vimeo / MP4"></label>`:''}
 <label>Widoczność<select id="portfolioVisible893"><option value="1" ${item.visible!==false?'selected':''}>Widoczny</option><option value="0" ${item.visible===false?'selected':''}>Ukryty</option></select></label>
 <div class="portfolioTileHelp893">Zdjęcie zaznaczysz bezpośrednio na stronie. Pełne kadrowanie, rozmiar, pozycję i podmianę pliku znajdziesz wyżej w panelu elementu.</div>
 <div class="portfolioTileActions893"><button id="portfolioEarlier893">← Wcześniej</button><button id="portfolioLater893">Później →</button><button id="portfolioDuplicate893">Duplikuj kafelek</button><button id="portfolioDelete893" class="portfolioDanger893">Usuń kafelek</button></div>`
}

function renderTilePanel(){
 $('#portfolioTile893')?.remove();const p=$('#rafPanel3'),{item,card}=itemAndCard();if(!p||!item||!card)return;
 selectedId=item.id;const box=document.createElement('section');box.id='portfolioTile893';box.innerHTML=tilePanelHtml(item);p.appendChild(box);
 const title=$('#portfolioTitle893',box),category=$('#portfolioCategory893',box),image=$('#portfolioImage893',box),video=$('#portfolioVideo893',box),visible=$('#portfolioVisible893',box);
 let started=false;const start=()=>{if(started)return;started=true;beginChange()};
 title.oninput=()=>{start();item.title=title.value;const el=$('.cap b',card);if(el){el.textContent=title.value;patchElement(el,{text:title.value})}markDirty()};
 category.oninput=()=>{start();item.category=category.value;const el=$('.cap small',card);if(el){el.textContent=category.value;patchElement(el,{text:category.value})}markDirty()};
 image.onchange=()=>{start();item.image=image.value.trim();const el=$('img',card);if(el){el.src=item.image;patchElement(el,{src:item.image})}markDirty()};
 if(video)video.oninput=()=>{start();item.video=video.value;markDirty()};
 visible.onchange=()=>{start();item.visible=visible.value==='1';card.classList.toggle('portfolioHidden893',!item.visible);patchElement(card,{hidden:!item.visible});markDirty()};
 $('#portfolioEarlier893',box).onclick=()=>moveItem(-1);$('#portfolioLater893',box).onclick=()=>moveItem(1);
 $('#portfolioDuplicate893',box).onclick=duplicateItem;$('#portfolioDelete893',box).onclick=deleteItem
}

function moveItem(direction){const i=items.findIndex(x=>x.id===selectedId),j=i+direction;if(i<0||j<0||j>=items.length)return;[items[i],items[j]]=[items[j],items[i]];markDirty();renderGrid(selectedId)}
function duplicateItem(){const i=items.findIndex(x=>x.id===selectedId);if(i<0)return;const copy=clone(items[i]);copy.id=`${type}-${Date.now()}`;copy.title=(copy.title||'Kafelek')+' — kopia';items.splice(i+1,0,copy);selectedId=copy.id;markDirty();renderGrid(selectedId)}
function deleteItem(){if(!selectedId||!confirm('Usunąć ten kafelek z portfolio?'))return;items=items.filter(x=>x.id!==selectedId);selectedId='';markDirty();renderGrid();window.rafCore760?.clear?.()}
function addItem(){const item={id:`${type}-${Date.now()}`,title:isFilm?'Nowy film':'Nowe zdjęcie',category:isFilm?'Film':'Fotografia',image:'',visible:true,desktop:defaultsCfg('desktop'),tablet:defaultsCfg('tablet'),mobile:defaultsCfg('mobile')};if(isFilm)item.video='';items.push(item);selectedId=item.id;markDirty();renderGrid(item.id)}

function installChrome(){
 const top=$('#rafTop3');if(!top)return false;
 if(!$('#portfolioAdd893')){const add=document.createElement('button');add.id='portfolioAdd893';add.textContent='+ Kafelek';add.onclick=addItem;top.insertBefore(add,$('#add3')?.nextSibling||$('#rafStatus3')||top.lastChild)}
 const exit=$('#exit3');if(exit)exit.onclick=()=>location.href=isFilm?'/film/':'/fotografia/';return true
}

async function publishItems(){
 try{await saveDraft();await set(ref(db,`${WEBSITE_ROOT}/public/${key}`),clone(items));status('✓ Kafelki i układ opublikowane')}
 catch(error){console.error('RAF portfolio publish',error);status('Błąd publikacji kafelków');alert('Błąd publikacji kafelków: '+error.message)}
}

function injectCss(){if($('#portfolioFull893Css'))return;const style=document.createElement('style');style.id='portfolioFull893Css';style.textContent=`
 body.raf-e3 .portfolioCard{cursor:pointer}.portfolioHidden893{opacity:.34!important;filter:grayscale(.65)}
 #portfolioTile893{border:1px solid #b54cff55;background:#140b1b;margin:12px 0 0;padding:11px;border-radius:11px}
 .portfolioTileTitle893{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}.portfolioTileTitle893 small{color:#d9a4ff;font-weight:900;letter-spacing:.12em}.portfolioTileTitle893 b{font-size:14px}
 .portfolioTileHelp893{font-size:9px;line-height:1.5;color:#999;margin:9px 0}.portfolioTileActions893{display:grid;grid-template-columns:1fr 1fr;gap:6px}.portfolioDanger893{border-color:#ff4e68!important;color:#ff9bac!important;background:#210b11!important}`;document.head.appendChild(style)}

async function init(){
 injectCss();const [published,draft]=await Promise.all([get(ref(db,`${WEBSITE_ROOT}/public/${key}`)),get(ref(db,`${WEBSITE_ROOT}/public/editorPortfolioDraft/${key}`))]);
 items=clone(normalize(draft.exists()?draft.val():published.val()));if(!items.length)items=deriveFromDom();renderGrid();
 window.addEventListener('raf:v760-selection',()=>setTimeout(renderTilePanel,90));window.addEventListener('raf:v760-change',()=>setTimeout(renderTilePanel,90));
 document.addEventListener('click',e=>{if(e.target.closest?.('#pub3'))publishItems()},true);
 let tries=0;const chromeTimer=setInterval(()=>{if(installChrome()||++tries>160)clearInterval(chromeTimer)},50);
 window.addEventListener('raf:v760-ready',()=>{installChrome();window.rafCore760?.refresh?.()});
 window.rafPortfolioFull893={items:()=>clone(items),add:addItem,publish:publishItems,render:renderGrid}
}

await init();

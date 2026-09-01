import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig, WEBSITE_ROOT } from "./firebase-config.js";

const fb = initializeApp(firebaseConfig);
const db = getDatabase(fb);
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const EDITOR_MODE = new URLSearchParams(location.search).get('editor') === '1';
const galleryUrl='https://galeria.raf-studio.pl/';
const legacyGalleryUrl='https://universalwebtools.github.io/raf.studio.galeria/';

const defaults={
  site:{heroK:'FOTOGRAFIA • FILM • BIELSKO-BIAŁA',heroT:'OBRAZ, KTÓRY ZOSTAJE.',heroD:'Fotografia i film tworzone z naciskiem na emocje, detal i nowoczesny, filmowy charakter.',email:'',phone:'',instagram:'',whatsapp:'',gallery:galleryUrl},
  photos:[
    {id:'p1',title:'Śluby / reportaż',category:'Śluby',image:'assets/photo-wedding.png',visible:true,desktop:{span:7,ratio:'4/3',x:50,y:50},tablet:{span:6,ratio:'4/3',x:50,y:50},mobile:{span:12,ratio:'4/3',x:50,y:50}},
    {id:'p2',title:'Sesje',category:'Sesje',image:'assets/photo-session.png',visible:true,desktop:{span:5,ratio:'4/3',x:50,y:50},tablet:{span:6,ratio:'4/3',x:50,y:50},mobile:{span:12,ratio:'4/3',x:50,y:50}},
    {id:'p3',title:'Produkt',category:'Produkt',image:'assets/photo-product.png',visible:true,desktop:{span:4,ratio:'4/3',x:50,y:50},tablet:{span:6,ratio:'4/3',x:50,y:50},mobile:{span:12,ratio:'1/1',x:50,y:50}},
    {id:'p4',title:'Eventy / marki',category:'Event',image:'assets/photo-event.png',visible:true,desktop:{span:8,ratio:'4/3',x:50,y:50},tablet:{span:6,ratio:'4/3',x:50,y:50},mobile:{span:12,ratio:'4/3',x:50,y:50}}
  ],
  films:[
    {id:'f1',title:'Film reklamowy',category:'Reklama',image:'assets/film-ad.png',video:'',visible:true,desktop:{span:8,ratio:'16/9',x:50,y:50},tablet:{span:6,ratio:'16/9',x:50,y:50},mobile:{span:12,ratio:'16/9',x:50,y:50}},
    {id:'f2',title:'Social media',category:'Social media',image:'assets/film-social.png',video:'',visible:true,desktop:{span:4,ratio:'16/9',x:50,y:50},tablet:{span:6,ratio:'16/9',x:50,y:50},mobile:{span:12,ratio:'16/9',x:50,y:50}},
    {id:'f3',title:'Event',category:'Event',image:'assets/film-event.png',video:'',visible:true,desktop:{span:5,ratio:'16/9',x:50,y:50},tablet:{span:6,ratio:'16/9',x:50,y:50},mobile:{span:12,ratio:'16/9',x:50,y:50}},
    {id:'f4',title:'Produkt / slow motion',category:'Slow motion',image:'assets/film-slowmo.png',video:'',visible:true,desktop:{span:7,ratio:'16/9',x:50,y:50},tablet:{span:6,ratio:'16/9',x:50,y:50},mobile:{span:12,ratio:'16/9',x:50,y:50}}
  ],
  reviews:[{name:'Klient RAF.studio',text:'Świetny kontakt, piękny efekt i bardzo sprawna realizacja.'},{name:'Marka / event',text:'Materiały wyglądały dokładnie tak, jak chcieliśmy — nowocześnie i profesjonalnie.'}],
  clients:['DAVIS','EVENT','PRODUCT','SOCIAL']
};
let state=structuredClone(defaults);

function mergeState(remote){
  if(!remote)return;
  state.site={...state.site,...(remote.site||{})};
  if(!state.site.gallery || state.site.gallery===legacyGalleryUrl || state.site.gallery.includes('universalwebtools.github.io/raf.studio.galeria')) state.site.gallery=galleryUrl;
  if(Array.isArray(remote.photos))state.photos=remote.photos;
  if(Array.isArray(remote.films))state.films=remote.films;
  if(Array.isArray(remote.reviews))state.reviews=remote.reviews;
  if(Array.isArray(remote.clients))state.clients=remote.clients;
}
function deviceSettings(item){const w=innerWidth;return w<=640?(item.mobile||item.desktop):w<=980?(item.tablet||item.desktop):(item.desktop||{});}
function applySite(){
  $$('[data-gallery]').forEach(a=>a.href=state.site.gallery||galleryUrl);
  if($('#heroK'))$('#heroK').textContent=state.site.heroK;
  if($('#heroT'))$('#heroT').innerHTML=(state.site.heroT||'').replace(/, /,',<br>');
  if($('#heroD'))$('#heroD').textContent=state.site.heroD;
  $$('[data-email]').forEach(a=>{if(state.site.email){a.textContent=state.site.email;a.href='mailto:'+state.site.email}else a.style.display='none'});
  $$('[data-phone]').forEach(a=>{if(state.site.phone){a.textContent=state.site.phone;a.href='tel:'+state.site.phone}else a.style.display='none'});
  $$('[data-instagram]').forEach(a=>{if(state.site.instagram)a.href=state.site.instagram});
  $$('[data-whatsapp]').forEach(a=>{if(state.site.whatsapp){a.href='https://wa.me/'+state.site.whatsapp.replace(/\D/g,'');a.style.display='grid'}else a.style.display='none'});
}
function itemCard(item,type){const d=deviceSettings(item), el=document.createElement('article');el.className='portfolioCard reveal';el.style.setProperty('--span',d.span||12);el.style.aspectRatio=d.ratio||'4/3';el.dataset.id=item.id;el.dataset.type=type;el.innerHTML=`<img loading="lazy" src="${item.image}" alt="${item.title}"><div class="shade"></div><div class="cap"><small>${item.category||''}</small><b>${item.title}</b>${type==='film'?'<span class="play">▶</span>':''}</div>`;const im=$('img',el);im.style.objectPosition=`${d.x??50}% ${d.y??50}%`;el.addEventListener('click',()=>type==='photo'?openLightbox(item.id):openVideo(item));return el;}
function renderGrid(id,items,type){const g=$(id);if(!g)return;g.innerHTML='';items.filter(x=>x.visible!==false).forEach(x=>g.append(itemCard(x,type)));reveal();}
function renderExtras(){const r=$('#reviews');if(r){r.innerHTML='';state.reviews.forEach(x=>r.insertAdjacentHTML('beforeend',`<div class="review"><p>“${x.text}”</p><b>${x.name}</b></div>`));}const l=$('#logos');if(l){l.innerHTML='';state.clients.forEach(x=>l.insertAdjacentHTML('beforeend',`<div class="logoChip">${x}</div>`));}}
function render(){applySite();renderGrid('#photoGrid',state.photos,'photo');renderGrid('#filmGrid',state.films,'film');renderExtras();}

function ensureLightbox(){if($('#lightbox'))return;document.body.insertAdjacentHTML('beforeend',`<div id="lightbox" class="lightbox" hidden><button class="lbClose">×</button><button class="lbPrev">‹</button><img><div class="lbCaption"></div><button class="lbNext">›</button></div>`);$('.lbClose').onclick=closeLightbox;$('.lbPrev').onclick=()=>stepLight(-1);$('.lbNext').onclick=()=>stepLight(1);$('#lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')closeLightbox()});}
let lbItems=[],lbIndex=0;
function openLightbox(id){ensureLightbox();lbItems=state.photos.filter(x=>x.visible!==false);lbIndex=Math.max(0,lbItems.findIndex(x=>x.id===id));showLb();}
function showLb(){const x=lbItems[lbIndex],lb=$('#lightbox');$('img',lb).src=x.image;$('.lbCaption',lb).textContent=x.title;lb.hidden=false;document.body.style.overflow='hidden';}
function stepLight(n){lbIndex=(lbIndex+n+lbItems.length)%lbItems.length;showLb()}
function closeLightbox(){if($('#lightbox'))$('#lightbox').hidden=true;document.body.style.overflow=''}
function videoEmbed(url){if(!url)return'';try{const u=new URL(url);if(u.hostname.includes('youtu')){const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');return id?`https://www.youtube.com/embed/${id}?autoplay=1`:''}if(u.hostname.includes('vimeo.com')){const id=u.pathname.split('/').filter(Boolean).pop();return`https://player.vimeo.com/video/${id}?autoplay=1`}}catch{}return url;}
function openVideo(item){const url=videoEmbed(item.video||'');if(!url){location.href=`realizacja.html?id=${encodeURIComponent(item.id)}&type=film`;return}let m=$('#videoModal');if(!m){document.body.insertAdjacentHTML('beforeend',`<div id="videoModal" class="videoModal" hidden><div class="videoBox"><button>×</button><div class="videoStage"></div></div></div>`);m=$('#videoModal');$('button',m).onclick=()=>{m.hidden=true;$('.videoStage',m).innerHTML=''};m.onclick=e=>{if(e.target===m)$('button',m).click()};}const st=$('.videoStage',m);st.innerHTML=url.match(/\.(mp4|webm)(\?|$)/i)?`<video src="${url}" controls autoplay playsinline></video>`:`<iframe src="${url}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;m.hidden=false;}
function reveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});$$('.reveal:not(.in)').forEach(e=>io.observe(e));}
function initCookie(){const b=$('#cookieBar');if(!b)return;if(localStorage.rafCookies==='ok')b.remove();else $('button',b).onclick=()=>{localStorage.rafCookies='ok';b.remove()}}
function initMobileNav(){if($('.mobileDock'))return;document.body.insertAdjacentHTML('beforeend',`<nav class="mobileDock"><a href="fotografia.html">Foto</a><a href="film.html">Film</a><a data-gallery href="${state.site.gallery||galleryUrl}">Galeria</a><a href="index.html#kontakt">Kontakt</a></nav>`)}
async function loadCloud(){try{onValue(ref(db,WEBSITE_ROOT+'/public'),snap=>{if(snap.exists()){state=structuredClone(defaults);mergeState(snap.val());render();initMobileNav();applySite();}})}catch(e){console.warn('Firebase public sync unavailable',e)}}
window.addEventListener('resize',()=>{renderGrid('#photoGrid',state.photos,'photo');renderGrid('#filmGrid',state.films,'film')});
render();reveal();initCookie();initMobileNav();if(!EDITOR_MODE)loadCloud();

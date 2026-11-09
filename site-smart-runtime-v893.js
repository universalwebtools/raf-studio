// RAF.studio — SEO, responsive media and privacy-friendly counters v8.9.3
import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,runTransaction} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {firebaseConfig,WEBSITE_ROOT} from './firebase-config.js';
const app=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(app),Q=new URLSearchParams(location.search),EDITOR=Q.has('editor');
const escKey=s=>String(s||'home').replace(/[.#$\[\]/]/g,'_').slice(0,80),pageKey=()=>escKey(location.pathname.replace(/^\/+|\/+$/g,'')||'home'),dayKey=()=>new Date().toLocaleDateString('sv-SE');
function meta(name,value,property=false){if(!value)return;const attr=property?'property':'name';let el=document.head.querySelector(`meta[${attr}="${CSS.escape(name)}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,name);document.head.appendChild(el)}el.content=value}
function applyResponsive(root=document){root.querySelectorAll?.('img').forEach(img=>{const src=img.currentSrc||img.src||'',m=src.match(/^(.*)-(?:800|1600|2400)\.webp(\?.*)?$/i);if(!m||img.srcset)return;img.srcset=`${m[1]}-800.webp${m[2]||''} 800w, ${m[1]}-1600.webp${m[2]||''} 1600w, ${m[1]}-2400.webp${m[2]||''} 2400w`;img.sizes=img.sizes||'(max-width: 760px) 100vw, 80vw';img.loading=img.closest('header,.hero,[data-raf-section="Hero"]')?'eager':'lazy';img.decoding='async'})}
async function applySeo(){
 let cfg={};try{cfg=(await get(ref(db,`${WEBSITE_ROOT}/public/seo`))).val()||{}}catch{}
 const page=pageKey(),h1=document.querySelector('h1')?.textContent?.trim().replace(/\s+/g,' '),site=cfg.siteName||'RAF Studio',city=cfg.city||'Bielsko-Biała';
 const title=cfg.pages?.[page]?.title||(page==='fotografia'?`Fotografia – sesje, śluby i eventy | ${site}`:page==='film'?`Filmowanie i produkcja wideo | ${site}`:cfg.title||`${site} – Fotografia i Film | ${city}`);
 const description=cfg.pages?.[page]?.description||cfg.description||document.querySelector('meta[name="description"]')?.content||'RAF Studio — fotografia, film i historie blisko ludzi.';
 document.title=title;meta('description',description);meta('og:title',title,true);meta('og:description',description,true);meta('og:type','website',true);meta('og:url',location.origin+location.pathname,true);meta('twitter:card','summary_large_image');
 if(cfg.ogImage){meta('og:image',cfg.ogImage,true);meta('twitter:image',cfg.ogImage)}
 let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)}canonical.href=location.origin+location.pathname;
 const ld={"@context":"https://schema.org","@type":"ProfessionalService",name:site,url:location.origin,description,image:cfg.ogImage||undefined,email:cfg.email||undefined,telephone:cfg.phone||undefined,address:cfg.city?{"@type":"PostalAddress",addressLocality:cfg.city,addressCountry:'PL'}:undefined,areaServed:cfg.areaServed||'Śląsk',sameAs:(cfg.socials||[]).filter(Boolean)};
 let script=document.querySelector('#rafSeoJsonLd893');if(!script){script=document.createElement('script');script.id='rafSeoJsonLd893';script.type='application/ld+json';document.head.appendChild(script)}script.textContent=JSON.stringify(ld);
 document.documentElement.dataset.rafSeo='ready';
}
async function count(kind,name){try{await runTransaction(ref(db,`${WEBSITE_ROOT}/analytics/daily/${dayKey()}/${kind}/${escKey(name)}`),x=>(Number(x)||0)+1)}catch{}}
function analytics(){if(EDITOR||navigator.globalPrivacyControl)return;const key=`rafHit893:${dayKey()}:${pageKey()}`;if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'1');count('pageviews',pageKey())}addEventListener('click',e=>{const a=e.target.closest?.('a,button');if(!a)return;const href=a.getAttribute?.('href')||'',txt=(a.textContent||'').trim();let action='';if(/mailto:|tel:|kontakt|contact/i.test(href+' '+txt))action='kontakt';else if(/fotografia/i.test(href+' '+txt))action='fotografia';else if(/film/i.test(href+' '+txt))action='film';else if(/galeria|strefa klienta/i.test(href+' '+txt))action='strefa_klienta';if(action)count('actions',action)},true)}
applyResponsive();new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>n.nodeType===1&&applyResponsive(n)))).observe(document.documentElement,{subtree:true,childList:true});
if(!EDITOR){applySeo();analytics()}

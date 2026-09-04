// RAF.studio public shell v8.2.1 — clean URLs, privacy, responsive layer
import './privacy-center-v800.js?v=8.2.1';
import './form-protection-v800.js?v=8.2.1';

const Q=new URLSearchParams(location.search),EDITOR=Q.has('editor'),PREVIEW=Q.has('tplPreview');
const cleanPath=p=>{
 const x=String(p||'').replace(/\?.*$/,'').replace(/#.*$/,'');
 if(x==='/'||x==='/index.html')return'/';
 if(/\/index\.html$/i.test(x))return x.replace(/index\.html$/i,'');
 if(/\/fotografia\.html$/i.test(x))return'/fotografia/';
 if(/\/film\.html$/i.test(x))return'/film/';
 if(/\/(?:privacy|polityka-prywatnosci)\.html$/i.test(x))return'/polityka-prywatnosci/';
 if(/\/admin\.html$/i.test(x))return'/admin/';
 return'';
};
function installCss(){if(document.querySelector('link[data-raf-responsive="800"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='/responsive-v800.css?v=8.2.1';l.dataset.rafResponsive='800';document.head.appendChild(l)}
function cleanAddress(){if(EDITOR||PREVIEW)return;const p=location.pathname.toLowerCase();let next='';if(p.endsWith('/index.html'))next=p.slice(0,-10)||'/';else if(p.endsWith('/fotografia.html'))next='/fotografia/';else if(p.endsWith('/film.html'))next='/film/';else if(p.endsWith('/privacy.html')||p.endsWith('/polityka-prywatnosci.html'))next='/polityka-prywatnosci/';if(next)history.replaceState(null,'',next+location.search+location.hash)}
function repairLinks(root=document){root.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute('href')||'';if(!raw||raw.startsWith('#')||/^(mailto:|tel:|https?:\/\/)/i.test(raw))return;let u;try{u=new URL(raw,location.href)}catch{return}if(u.origin!==location.origin)return;const p=cleanPath(u.pathname);if(p)a.setAttribute('href',p+u.search+u.hash)});root.querySelectorAll('a[href*="admin"],[data-raf-element="navAdmin"]').forEach(a=>a.remove());const footer=root.querySelector('footer.footer,footer');if(footer&&!footer.querySelector('[data-privacy-settings]')){const box=document.createElement('span');box.className='rafFooterPrivacy800';box.innerHTML='<a href="/polityka-prywatnosci/">Polityka prywatności</a><button type="button" data-privacy-settings>Ustawienia cookies</button>';footer.appendChild(box)}}
function run(){installCss();cleanAddress();repairLinks();if(PREVIEW){document.documentElement.classList.remove('raf-public-boot');document.documentElement.classList.add('raf-public-ready')}document.documentElement.dataset.rafVersion='8.2.1';window.dispatchEvent(new CustomEvent('raf:v800-ready'))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>repairLinks(),40)}).observe(document.documentElement,{subtree:true,childList:true});

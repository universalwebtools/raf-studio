import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig, WEBSITE_ROOT } from "./firebase-config.js";
const app=initializeApp(firebaseConfig),db=getDatabase(app);
const CONTENT_QUERY=new URLSearchParams(location.search),EDITOR_MODE=CONTENT_QUERY.has('editor')||CONTENT_QUERY.has('tplPreview');
const defaults={
 twoWorldsTitle:'DWA ŚWIATY.\nJEDEN STYL.',twoWorldsDesc:'Osobne działy fotografii i filmu, wspólna estetyka RAF.studio.',
 photoTitle:'FOTOGRAFIA',photoDesc:'Śluby, sesje, eventy, produkt i wizerunek.',photoButton:'Wejdź →',
 filmTitle:'FILM',filmDesc:'Reklama, eventy, social media, produkt i slow motion.',filmButton:'Wejdź →',
 aboutEyebrow:'O MNIE',aboutTitle:'CZŁOWIEK PO DRUGIEJ STRONIE KAMERY.',aboutDesc:'Tworzę zdjęcia i filmy dla ludzi oraz marek. Lubię czysty obraz, prawdziwe emocje, dobre światło i realizacje, które nie wyglądają jak gotowy szablon.',
 fact1Title:'FOTOGRAFIA',fact1Text:'Śluby • sesje • eventy • produkt',fact2Title:'FILM',fact2Text:'Reklama • social • event • slow motion',fact3Title:'RAF.studio',fact3Text:'Jedna spójna identyfikacja.',
 reviewsTitle:'OPINIE.',reviewsDesc:'Rekomendacje klientów.',brandsTitle:'MARKI.',brandsDesc:'Wybrane współprace.',
 contactEyebrow:'KONTAKT',contactTitle:'ZRÓBMY COŚ DOBREGO.',contactDesc:'Fotografia, film albo oba naraz.',
 showTwoWorlds:true,showAbout:true,showReviews:true,showBrands:true,showContact:true
};
function render(raw={}){const c={...defaults,...raw};document.querySelectorAll('[data-home-text]').forEach(el=>{const k=el.dataset.homeText;if(!(k in c))return;const v=String(c[k]??'');if(el.dataset.multiline==='1')el.innerHTML=v.replace(/\n/g,'<br>');else el.textContent=v});document.querySelectorAll('[data-home-section]').forEach(el=>{const k='show'+el.dataset.homeSection;el.style.display=c[k]===false?'none':''})}
render();
if(!EDITOR_MODE)onValue(ref(db,`${WEBSITE_ROOT}/public/homeContent`),s=>render(s.val()||{}));

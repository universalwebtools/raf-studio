import { getApps, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 100 && !getApps().length; i++) await sleep(50);
if (!getApps().length) throw new Error('Firebase nie zostało zainicjalizowane.');

const app = getApp();
const auth = getAuth(app);
const db = getDatabase(app);
const $ = s => document.querySelector(s);

function box(name, text, kind='warn') {
  return `<div class="statusBox ${kind}"><b><span class="statusDot"></span>${name}</b><span class="tiny">${text}</span></div>`;
}

async function renderFixedStatus() {
  const grid = $('#statusGrid');
  if (!grid) return;

  let firebaseText = 'Sprawdzanie…';
  let firebaseKind = 'warn';
  try {
    await get(ref(db, 'website/public'));
    firebaseText = 'Połączenie działa — website/public dostępne';
    firebaseKind = 'ok';
  } catch (e) {
    firebaseText = `Brak dostępu do website/public: ${e.code || e.message}`;
    firebaseKind = 'bad';
  }

  const user = auth.currentUser;
  const cmsText = user ? `Zalogowany: ${user.email || 'Administrator'} — zapis chroniony` : 'Brak sesji administratora';
  const cmsKind = user ? 'ok' : 'bad';
  const gallery = document.querySelector('#gallery')?.value || 'https://universalwebtools.github.io/raf.studio.galeria/';
  const backup = localStorage.getItem('rafStudioV3Backup');

  grid.innerHTML =
    box('Firebase', firebaseText, firebaseKind) +
    box('Zapis CMS', cmsText, cmsKind) +
    box('Storage', user ? 'Połączony — zapis wymaga zalogowanego administratora' : 'Połączony — oczekuje logowania', user ? 'ok' : 'warn') +
    box('GitHub Pages', location.hostname.includes('github.io') ? 'Strona działa z GitHub Pages' : 'Tryb lokalny', 'ok') +
    box('Galeria klienta', gallery, 'ok') +
    box('Backup lokalny', backup ? 'Jest zapisany' : 'Brak backupu', backup ? 'ok' : 'warn');
}

onAuthStateChanged(auth, () => setTimeout(renderFixedStatus, 100));
['#runDiagnostics', '#checkLinks', '#saveCloud'].forEach(sel => {
  document.querySelector(sel)?.addEventListener('click', () => setTimeout(renderFixedStatus, 500));
});

const grid = $('#statusGrid');
if (grid) {
  let busy = false;
  new MutationObserver(() => {
    if (busy) return;
    const wrong = grid.textContent.includes('Tryb bez logowania') || grid.textContent.includes('Brak dostępu');
    if (!wrong) return;
    busy = true;
    setTimeout(async () => { await renderFixedStatus(); busy = false; }, 50);
  }).observe(grid, {childList:true, subtree:true, characterData:true});
}

setTimeout(renderFixedStatus, 250);
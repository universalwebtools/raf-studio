// Skąd edytor bierze treść i dokąd ją zapisuje.
//  • lokalnie (localhost): przez server.mjs na tym komputerze,
//  • online: logowanie kontem Firebase, treść i strona zapisywane jako commit w repozytorium GitHub.

const CONTENT_FILES = ['site', 'home', 'services', 'portfolio', 'blog'];

// Adres bazowy strony, np. '' na raf-studio.pl albo '/raf-studio-podglad' na stronie testowej.
export const SITE_BASE = location.pathname.replace(/\/admin(\/.*)?$/, '');

const slugify = (s) => String(s).toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'zdjecie';

/* ---------- Tryb lokalny ---------- */
function localBackend() {
  return {
    mode: 'local',
    saveLabel: 'Zapisz',
    async load() {
      const data = {};
      await Promise.all(CONTENT_FILES.map(async (f) => { data[f] = await (await fetch(`/content/${f}.json`, { cache: 'no-store' })).json(); }));
      return data;
    },
    async save(data) {
      const res = await fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'Błąd zapisu');
      return `✓ Zapisano · ${out.pages} podstron gotowych`;
    },
    async upload(file) {
      const res = await fetch('/api/upload?name=' + encodeURIComponent(file.name), { method: 'POST', body: file });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'Błąd wgrywania');
      return out.src;
    },
    mediaUrl: (src) => '/' + src,
    previewHtml: (html) => html,
    hasPending: () => false,
  };
}

/* ---------- Tryb online ---------- */
const FB = 'https://www.gstatic.com/firebasejs/10.14.1';
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC3sl83q1pmYx5bgEyCPu659xvc5Nsajo0',
  authDomain: 'raf-studio-strona.firebaseapp.com',
  databaseURL: 'https://raf-studio-strona-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'raf-studio-strona',
  appId: '1:302300072088:web:4417bb7718faf7d20e68ed',
};
const TOKEN_PATH = 'website/private/github/token';

// Zdjęcie → WebP, maks. 2000 px dłuższego boku, w przeglądarce.
async function toWebp(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/webp', 0.82));
  if (!blob || blob.type !== 'image/webp') throw new Error('Ta przeglądarka nie umie zapisać WebP – użyj Chrome, Edge lub Firefoksa.');
  return blob;
}

const b64 = async (blob) => {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
};
const fromB64Utf8 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, '')), (c) => c.charCodeAt(0)));

async function onlineBackend(ui) {
  const cfg = await (await fetch(`${SITE_BASE}/site-config.json`, { cache: 'no-store' })).json();
  const repo = cfg.repo; // { owner, name, branch }
  const [{ initializeApp }, auth, db] = await Promise.all([
    import(`${FB}/firebase-app.js`), import(`${FB}/firebase-auth.js`), import(`${FB}/firebase-database.js`),
  ]);
  const app = initializeApp(FIREBASE_CONFIG);
  const fbAuth = auth.getAuth(app);
  const fbDb = db.getDatabase(app);

  // 1. Logowanie
  let user = await new Promise((ok) => { const off = auth.onAuthStateChanged(fbAuth, (u) => { off(); ok(u); }); });
  while (!user) {
    const { email, password } = await ui.askLogin();
    try { user = (await auth.signInWithEmailAndPassword(fbAuth, email, password)).user; }
    catch (e) { ui.loginError(/invalid|wrong|user-not-found/.test(e.code) ? 'Nieprawidłowy e-mail lub hasło.' : 'Nie udało się zalogować: ' + e.code); }
  }

  // 2. Klucz do GitHuba (zapisany w Firebase, dostępny tylko dla konta admina)
  let token;
  try { token = (await db.get(db.ref(fbDb, TOKEN_PATH))).val(); }
  catch (e) { throw new Error('To konto nie ma uprawnień administratora strony.'); }
  const gh = async (path, opts = {}) => {
    const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}${path}`, {
      ...opts, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
    });
    if (!res.ok) { const err = new Error(`GitHub ${res.status}: ${(await res.json().catch(() => ({}))).message || res.statusText}`); err.status = res.status; throw err; }
    return res.status === 204 ? null : res.json();
  };
  for (;;) {
    if (token) { try { await gh(''); break; } catch (e) { if (e.status !== 401 && e.status !== 404) throw e; ui.tokenError('Klucz GitHub jest nieprawidłowy albo wygasł.'); } }
    token = (await ui.askToken()).trim();
    try { await gh(''); await db.set(db.ref(fbDb, TOKEN_PATH), token); break; }
    catch (e) { ui.tokenError(e.status === 401 || e.status === 404 ? 'GitHub nie przyjął tego klucza. Sprawdź, czy ma dostęp do repozytorium ' + repo.name + '.' : e.message); token = null; }
  }

  const pending = new Map(); // 'media/x.webp' → { blob, url }

  return {
    mode: 'online',
    saveLabel: 'Opublikuj',
    user: user.email,
    async logout() { await auth.signOut(fbAuth); location.reload(); },
    async load() {
      const data = {};
      await Promise.all(CONTENT_FILES.map(async (f) => {
        const file = await gh(`/contents/site/content/${f}.json?ref=${encodeURIComponent(repo.branch)}`);
        data[f] = JSON.parse(fromB64Utf8(file.content));
      }));
      return data;
    },
    async upload(file) {
      if (!file.type.startsWith('image/')) throw new Error('To nie jest zdjęcie: ' + file.name);
      const blob = await toWebp(file);
      const src = `media/${slugify(file.name.replace(/\.[^.]+$/, ''))}-${Date.now().toString(36)}.webp`;
      pending.set(src, { blob, url: URL.createObjectURL(blob) });
      return src;
    },
    mediaUrl: (src) => pending.get(src)?.url || `${SITE_BASE}/${src}`,
    previewHtml(html) {
      for (const [src, p] of pending) html = html.split(`${SITE_BASE}/${src}`).join(p.url);
      return html;
    },
    hasPending: () => pending.size > 0,
    async save(data, renderSite, progress) {
      progress('Przygotowanie stron…');
      const head = await gh(`/git/ref/heads/${encodeURIComponent(repo.branch)}`);
      const headCommit = await gh(`/git/commits/${head.object.sha}`);
      const tree = await gh(`/git/trees/${headCommit.tree.sha}?recursive=1`);

      const entries = [];
      for (const f of CONTENT_FILES) entries.push({ path: `site/content/${f}.json`, mode: '100644', type: 'blob', content: JSON.stringify(data[f], null, 2) + '\n' });
      const pages = renderSite(data, { base: cfg.base, noindex: cfg.noindex });
      for (const [p, text] of Object.entries(pages)) entries.push({ path: `docs/${p}`, mode: '100644', type: 'blob', content: text });

      // Usuń podstrony, które zniknęły (np. usunięty wpis lub zmieniony adres usługi).
      const generated = /^docs\/(uslugi|blog)\/[^/]+\/index\.html$/;
      for (const t of tree.tree) if (generated.test(t.path) && !(t.path.slice(5) in pages)) entries.push({ path: t.path, mode: '100644', type: 'blob', sha: null });

      // Nowe zdjęcia – tylko te, których strona faktycznie używa.
      const json = JSON.stringify(data);
      let n = 0;
      for (const [src, p] of pending) {
        if (!json.includes(`"${src}"`)) continue;
        progress(`Wysyłanie zdjęć ${++n}…`);
        const blob = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: await b64(p.blob), encoding: 'base64' }) });
        entries.push({ path: `site/${src}`, mode: '100644', type: 'blob', sha: blob.sha });
        entries.push({ path: `docs/${src}`, mode: '100644', type: 'blob', sha: blob.sha });
      }

      progress('Zapisywanie…');
      const newTree = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: entries }) });
      if (newTree.sha === headCommit.tree.sha) { pending.clear(); return 'Bez zmian – strona jest aktualna'; }
      const commit = await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message: `Aktualizacja strony z edytora (${user.email})`, tree: newTree.sha, parents: [head.object.sha] }) });
      try {
        await gh(`/git/refs/heads/${encodeURIComponent(repo.branch)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
      } catch (e) {
        if (e.status === 422) throw new Error('Ktoś w międzyczasie zmienił stronę. Odśwież edytor i spróbuj ponownie.');
        throw e;
      }
      pending.clear();
      return '✓ Opublikowano – strona odświeży się w ciągu ok. minuty';
    },
  };
}

export async function createBackend(ui) {
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  return local ? localBackend() : onlineBackend(ui);
}

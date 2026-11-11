// Edytor RAF.studio – edycja treści z podglądem na żywo.
import { routes, renderSite } from '../src/templates.mjs';
import { createBackend, SITE_BASE } from './backend.js';

let backend;
const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k in el && k !== 'list') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
  return el;
};

/* ---------- Stan ---------- */
let data = {};
let savedSnap = '';
let lastSnap = '';
const undoStack = [];
let currentPanel = null;
let previewPath = '';
let openPortfolioItem = -1;

const parts = (path) => path.split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p));
function get(path) { return parts(path).reduce((o, k) => (o == null ? undefined : o[k]), data); }
function set(path, value) {
  const ks = parts(path); const last = ks.pop();
  const obj = ks.reduce((o, k) => o[k], data);
  obj[last] = value;
}
const snap = () => JSON.stringify(data);

const slugify = (s) => String(s).toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

/* ---------- Status, zapis, cofanie ---------- */
const statusEl = $('#status'), saveBtn = $('#save'), undoBtn = $('#undo');
function updateStatus(msg, kind) {
  const dirty = snap() !== savedSnap;
  saveBtn.disabled = !dirty;
  undoBtn.disabled = undoStack.length === 0 && snap() === lastSnap;
  statusEl.className = 'status' + (kind ? ` is-${kind}` : dirty ? ' is-dirty' : '');
  statusEl.textContent = msg || (dirty ? '● Niezapisane zmiany' : 'Wszystko zapisane');
}
let historyTimer;
function commitHistory() {
  clearTimeout(historyTimer);
  const s = snap();
  if (s !== lastSnap) { undoStack.push(lastSnap); if (undoStack.length > 80) undoStack.shift(); lastSnap = s; }
}
function changed({ rerender = false } = {}) {
  clearTimeout(historyTimer);
  historyTimer = setTimeout(() => { commitHistory(); updateStatus(); }, 600);
  if (rerender) { commitHistory(); renderPanel(); }
  schedulePreview();
  updateStatus();
}
function undo() {
  commitHistory();
  const prev = undoStack.pop();
  if (!prev) return;
  data = JSON.parse(prev); lastSnap = prev;
  renderSide(); renderPanel(); renderPreview(); updateStatus();
  toast('Cofnięto ostatnią zmianę');
}
let saving = false;
async function save() {
  if (saving) return;
  commitHistory();
  saving = true;
  saveBtn.disabled = true;
  updateStatus('Zapisywanie…');
  try {
    const before = snap();
    const msg = await backend.save(JSON.parse(before), renderSite, (m) => updateStatus(m));
    savedSnap = before;
    updateStatus(msg, 'ok');
    setTimeout(() => updateStatus(), 6000);
  } catch (e) {
    updateStatus('Nie udało się zapisać: ' + e.message, 'err');
    saveBtn.disabled = false;
  } finally { saving = false; }
}
function toast(msg, err) {
  const t = h('div', { class: 'toast' + (err ? ' is-err' : '') }, msg);
  document.body.append(t); setTimeout(() => t.remove(), 2600);
}

/* ---------- Wgrywanie zdjęć ---------- */
async function upload(file) {
  if (!file.type.startsWith('image/')) throw new Error('To nie jest zdjęcie: ' + file.name);
  updateStatus(`Przygotowanie ${file.name}…`);
  const src = await backend.upload(file);
  updateStatus();
  return src;
}
const media = (src) => (src ? backend.mediaUrl(src) : '');
const pickFiles = (multiple) => new Promise((ok) => {
  const inp = h('input', { type: 'file', accept: 'image/*', multiple });
  inp.addEventListener('change', () => ok([...inp.files]));
  inp.click();
});

/* ---------- Pola formularza ---------- */
function fieldText(path, f) {
  const val = get(path) ?? '';
  const multi = f.type === 'textarea';
  const counter = f.max ? h('span', { class: 'counter' }) : null;
  const upd = (v) => { if (counter) { counter.textContent = `${v.length}/${f.max}`; counter.classList.toggle('is-over', v.length > f.max); } };
  const input = h(multi ? 'textarea' : 'input', {
    type: multi ? null : (f.type === 'email' || f.type === 'url' || f.type === 'date' || f.type === 'number' ? f.type : 'text'),
    value: val, rows: multi ? (f.rows || 4) : null, placeholder: f.placeholder || '', 'data-path': path, id: 'f-' + path,
    oninput: (e) => { let v = e.target.value; if (f.type === 'number') v = Number(v); set(path, v); upd(String(v)); changed(); },
    onchange: (e) => { if (f.slug) { const s = slugify(e.target.value); e.target.value = s; set(path, s); changed({ rerender: true }); } },
  });
  upd(String(val));
  return h('div', { class: 'field' }, h('label', { for: 'f-' + path }, f.label, counter), input, f.help && h('div', { class: 'help' }, f.help));
}

function fieldCheckbox(path, f) {
  return h('div', { class: 'field' }, h('label', {},
    h('input', { type: 'checkbox', checked: !!get(path), 'data-path': path, onchange: (e) => { set(path, e.target.checked); changed(); } }),
    ' ', f.label), f.help && h('div', { class: 'help' }, f.help));
}

function fieldSelect(path, f) {
  const opts = typeof f.options === 'function' ? f.options() : f.options;
  return h('div', { class: 'field' }, h('label', {}, f.label),
    h('select', { 'data-path': path, onchange: (e) => { set(path, e.target.value); changed(); } },
      opts.map(([v, l]) => h('option', { value: v, selected: get(path) === v }, l))),
    f.help && h('div', { class: 'help' }, f.help));
}

function fieldImage(path, f) {
  let img = get(path);
  if (!img) { img = { src: '', x: 50, y: 50, alt: '' }; set(path, img); }
  const dot = h('div', { class: 'img__dot' });
  const pic = h('img', { src: media(img.src), alt: '' });
  const placeDot = () => { dot.style.display = img.src ? '' : 'none'; dot.style.left = (img.x ?? 50) + '%'; dot.style.top = (img.y ?? 50) + '%'; };
  // Kropka musi leżeć na faktycznym obrazie (object-fit: contain zostawia marginesy).
  const frame = h('div', { class: 'img__frame', title: 'Kliknij, aby ustawić najważniejszy punkt zdjęcia' }, pic, dot);
  const fitDot = () => {
    const fw = frame.clientWidth, fh = frame.clientHeight, iw = pic.naturalWidth, ih = pic.naturalHeight;
    if (!iw) return placeDot();
    const s = Math.min(fw / iw, fh / ih), w = iw * s, hh = ih * s, ox = (fw - w) / 2, oy = (fh - hh) / 2;
    dot.style.display = '';
    dot.style.left = (ox + (img.x / 100) * w) + 'px'; dot.style.top = (oy + (img.y / 100) * hh) + 'px';
  };
  pic.addEventListener('load', fitDot);
  new ResizeObserver(fitDot).observe(frame);
  frame.addEventListener('click', (e) => {
    if (!img.src) return;
    const r = frame.getBoundingClientRect(), iw = pic.naturalWidth, ih = pic.naturalHeight;
    const s = Math.min(r.width / iw, r.height / ih), w = iw * s, hh = ih * s, ox = (r.width - w) / 2, oy = (r.height - hh) / 2;
    img.x = Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left - ox) / w) * 100)));
    img.y = Math.round(Math.max(0, Math.min(100, ((e.clientY - r.top - oy) / hh) * 100)));
    fitDot(); changed();
  });
  const replace = async (file) => {
    try { img.src = await upload(file); img.x = 50; img.y = 50; pic.src = media(img.src); changed(); toast('Zdjęcie wgrane'); }
    catch (e) { toast(e.message, true); updateStatus(); }
  };
  const box = h('div', { class: 'img', 'data-path': path },
    frame,
    h('div', { class: 'img__hint' }, 'Kliknij na zdjęciu najważniejszy punkt – zostanie widoczny przy kadrowaniu na każdym ekranie.'),
    h('div', { class: 'img__row' },
      h('button', { type: 'button', class: 'btn btn--small', onclick: async () => { const [file] = await pickFiles(false); if (file) replace(file); } }, '⬆ Zmień zdjęcie'),
      h('input', { type: 'text', value: img.alt || '', placeholder: 'Opis zdjęcia (dla Google i niewidomych)', oninput: (e) => { img.alt = e.target.value; changed(); } })));
  box.addEventListener('dragover', (e) => { e.preventDefault(); box.classList.add('is-drop'); });
  box.addEventListener('dragleave', () => box.classList.remove('is-drop'));
  box.addEventListener('drop', (e) => { e.preventDefault(); box.classList.remove('is-drop'); const file = e.dataTransfer.files[0]; if (file) replace(file); });
  placeDot();
  return h('div', { class: 'field' }, h('div', { class: 'label' }, f.label), box);
}

function listTools(path, i, arr, { min = 0 } = {}) {
  const move = (d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; changed({ rerender: true }); };
  return h('div', { class: 'list__tools' },
    h('button', { type: 'button', title: 'W górę', onclick: () => move(-1), disabled: i === 0 }, '↑'),
    h('button', { type: 'button', title: 'W dół', onclick: () => move(1), disabled: i === arr.length - 1 }, '↓'),
    h('button', { type: 'button', title: 'Usuń', disabled: arr.length <= min, onclick: () => { arr.splice(i, 1); changed({ rerender: true }); } }, '✕'));
}

function fieldStrings(path, f) {
  const arr = get(path) || (set(path, []), get(path));
  const multi = f.type === 'paragraphs';
  return h('div', { class: 'field' }, h('div', { class: 'label' }, f.label),
    h('div', { class: 'list' }, arr.map((v, i) => h('div', { class: 'list__item' },
      h(multi ? 'textarea' : 'input', { type: multi ? null : 'text', value: v, rows: multi ? 4 : null, 'data-path': `${path}.${i}`,
        oninput: (e) => { arr[i] = e.target.value; changed(); } }),
      listTools(path, i, arr)))),
    h('button', { type: 'button', class: 'btn btn--small', style: 'margin-top:8px', onclick: () => { arr.push(''); changed({ rerender: true }); } }, multi ? '+ Dodaj akapit' : '+ Dodaj pozycję'),
    f.help && h('div', { class: 'help' }, f.help));
}

function fieldGroups(path, f) {
  const arr = get(path) || (set(path, []), get(path));
  return h('div', { class: 'field' }, h('div', { class: 'label' }, f.label),
    h('div', { class: 'list' }, arr.map((_, i) => h('div', { class: 'list__item is-group' },
      h('div', { class: 'list__head' }, `${f.itemLabel || 'Pozycja'} ${i + 1}`, listTools(path, i, arr, { min: f.min || 0 })),
      renderFields(`${path}.${i}`, f.fields)))),
    f.max && arr.length >= f.max ? null : h('button', { type: 'button', class: 'btn btn--small', style: 'margin-top:8px', onclick: () => { arr.push(structuredClone(f.newItem)); changed({ rerender: true }); } }, `+ Dodaj: ${(f.itemLabel || 'pozycja').toLowerCase()}`),
    f.help && h('div', { class: 'help' }, f.help));
}

function renderFields(base, fields) {
  return fields.map((f) => {
    const path = f.key === '' ? base : base ? `${base}.${f.key}` : f.key;
    switch (f.type) {
      case 'image': return fieldImage(path, f);
      case 'paragraphs': case 'lines': return fieldStrings(path, f);
      case 'groups': return fieldGroups(path, f);
      case 'checkbox': return fieldCheckbox(path, f);
      case 'select': return fieldSelect(path, f);
      case 'note': return h('p', { class: 'help', style: 'margin:-6px 0 18px' }, f.text);
      default: return fieldText(path, f);
    }
  });
}

/* ---------- Definicje paneli ---------- */
const T = (key, label, extra = {}) => ({ key, label, type: 'text', ...extra });
const TA = (key, label, extra = {}) => ({ key, label, type: 'textarea', ...extra });
const IMG = (key = 'image', label = 'Zdjęcie') => ({ key, label, type: 'image' });
const P = (key = 'paragraphs', label = 'Akapity') => ({ key, label, type: 'paragraphs' });

const HOME = [
  ['hero', 'Nagłówek z wideo', [T('kicker', 'Mały napis nad tytułem'), T('title', 'Tytuł', { max: 40 }), TA('lead', 'Opis', { rows: 3 }), T('cta', 'Tekst przycisku'), IMG('image', 'Zdjęcie (widoczne zanim wczyta się wideo)'), { type: 'note', text: 'Wideo w tle: media/hero-1600.mp4 (komputer) i media/hero-854.mp4 (telefon). Wymianę wideo zrobię dla Ciebie – podmienię i skompresuję plik.' }]],
  ['about', 'O mnie', [T('title', 'Tytuł'), P(), IMG('image', 'Portret'), T('cta', 'Tekst przycisku')]],
  ['offer', 'Oferta (nagłówek)', [T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), { type: 'note', text: 'Karty usług edytujesz w grupie „Usługi” po lewej.' }]],
  ['approach', 'Zaufanie (ciemna sekcja)', [T('title', 'Tytuł'), P(), IMG()]],
  ['statement', 'Foto / Film', [{ key: '', type: 'groups', label: 'Kafelki', itemLabel: 'Kafelek', min: 1, max: 2, newItem: { title: '', text: '', link: '' }, fields: [T('title', 'Duży napis'), T('text', 'Podpis'), T('link', 'Link (np. uslugi/film/)')] }]],
  ['promise', 'Od rozmowy do historii', [T('title', 'Tytuł'), { key: 'items', label: 'Punkty', type: 'lines' }]],
  ['portfolio', 'Portfolio (zapowiedź)', [T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), T('count', 'Ile zdjęć pokazać na stronie głównej', { type: 'number' }), { type: 'note', text: 'Same zdjęcia dodajesz w „Portfolio” po lewej. Na stronie głównej pokazują się pierwsze z listy.' }]],
  ['film', 'Film', [T('title', 'Tytuł'), P(), IMG()]],
  ['process', 'Jak pracuję', [T('title', 'Tytuł'), { key: 'steps', type: 'groups', label: 'Kroki', itemLabel: 'Krok', min: 1, newItem: { title: '', text: '' }, fields: [T('title', 'Nazwa'), TA('text', 'Opis', { rows: 2 })] }]],
  ['reviews', 'Opinie klientów', [T('title', 'Tytuł'), { key: 'items', type: 'groups', label: 'Opinie', itemLabel: 'Opinia', newItem: { text: '', author: '' }, fields: [TA('text', 'Treść opinii', { rows: 3 }), T('author', 'Autor (np. Ania i Tomek, ślub 2026)')], help: 'Sekcja pojawi się na stronie, gdy dodasz przynajmniej jedną opinię. Wpisuj tylko prawdziwe opinie za zgodą klientów.' }]],
  ['journal', 'Dziennik (zapowiedź)', [T('label', 'Mały napis'), T('title', 'Tytuł'), { type: 'note', text: 'Wpisy dodajesz w grupie „Dziennik” po lewej.' }]],
  ['contact', 'Kontakt', [T('kicker', 'Mały napis'), T('title', 'Tytuł'), TA('text', 'Opis', { rows: 3 })]],
];

const SERVICE_FIELDS = [
  T('title', 'Nazwa usługi'),
  TA('short', 'Krótki opis (na karcie)', { rows: 3, max: 160 }),
  IMG('image', 'Zdjęcie główne'),
  TA('intro', 'Wstęp (pod tytułem na podstronie)', { rows: 2 }),
  P('paragraphs', 'Opis usługi'),
  { key: 'includes', label: 'W ramach realizacji', type: 'lines' },
  { key: 'portfolioCategory', label: 'Zdjęcia z portfolio na tej podstronie', type: 'select', options: () => [['', 'Wszystkie kategorie'], ...data.portfolio.categories.map((c) => [c, c])] },
  T('slug', 'Adres podstrony', { slug: true, help: 'Np. fotografia-slubna → raf-studio.pl/uslugi/fotografia-slubna/' }),
  T('seoTitle', 'Tytuł w Google', { max: 65 }),
  TA('seoDescription', 'Opis w Google', { rows: 3, max: 160 }),
];

const POST_FIELDS = [
  T('title', 'Tytuł wpisu'),
  { key: 'published', label: 'Opublikowany (widoczny na stronie)', type: 'checkbox' },
  T('date', 'Data', { type: 'date' }),
  TA('excerpt', 'Zajawka', { rows: 2, max: 160 }),
  IMG('image', 'Zdjęcie'),
  P('paragraphs', 'Treść'),
  T('slug', 'Adres wpisu', { slug: true, help: 'raf-studio.pl/blog/…/' }),
];

const SITE_FIELDS = [
  T('name', 'Nazwa'), T('tagline', 'Hasło pod logo'),
  T('email', 'E-mail', { type: 'email' }), T('phone', 'Telefon', { placeholder: 'np. 600 000 000' }),
  T('instagram', 'Instagram (link)', { type: 'url' }), T('facebook', 'Facebook (link)', { type: 'url' }), T('youtube', 'YouTube (link)', { type: 'url' }),
  T('gallery', 'Strefa klienta (link)', { type: 'url' }),
  T('city', 'Miasto'), T('region', 'Obszar działania (tekst)'),
  { key: 'areaServed', label: 'Obszar działania dla Google', type: 'lines' },
  T('seoTitle', 'Tytuł strony głównej w Google', { max: 65 }), TA('seoDescription', 'Opis strony głównej w Google', { rows: 3, max: 160 }),
  T('copyright', 'Tekst w stopce'),
];

function panels() {
  const list = [];
  for (const [key, label, fields] of HOME) {
    list.push({ id: `home.${key}`, group: 'Strona główna', label, base: `home.${key}`, page: key === 'contact' ? 'kontakt/' : '', fields });
  }
  data.services.forEach((s, i) => list.push({
    id: `service-${i}`, group: 'Usługi', label: s.title || 'Nowa usługa', base: `services.${i}`, page: `uslugi/${s.slug}/`, fields: SERVICE_FIELDS,
    danger: () => { if (confirm(`Usunąć usługę „${s.title}”?`)) { data.services.splice(i, 1); changed({ rerender: true }); renderSide(); openPanel('home.offer'); } },
  }));
  list.push({ id: 'service-add', group: 'Usługi', label: '+ Dodaj usługę', add: true, action: () => {
    const n = data.services.length + 1;
    data.services.push({ slug: `nowa-usluga-${n}`, title: 'Nowa usługa', short: '', image: { src: '', x: 50, y: 50, alt: '' }, portfolioCategory: '', intro: '', paragraphs: [''], includes: [], seoTitle: '', seoDescription: '' });
    changed(); renderSide(); openPanel(`service-${data.services.length - 1}`);
  } });
  list.push({ id: 'portfolio', group: 'Portfolio', label: 'Zdjęcia portfolio', base: 'portfolio', page: 'portfolio/', custom: renderPortfolio });
  data.blog.forEach((p, i) => list.push({
    id: `post-${i}`, group: 'Dziennik', label: (p.published ? '' : '◌ ') + (p.title || 'Nowy wpis'), base: `blog.${i}`, page: `blog/${p.slug}/`, fields: POST_FIELDS,
    danger: () => { if (confirm(`Usunąć wpis „${p.title}”?`)) { data.blog.splice(i, 1); changed({ rerender: true }); renderSide(); openPanel('home.journal'); } },
  }));
  list.push({ id: 'post-add', group: 'Dziennik', label: '+ Nowy wpis', add: true, action: () => {
    data.blog.unshift({ slug: `nowy-wpis-${Date.now().toString(36)}`, title: 'Nowy wpis', date: new Date().toISOString().slice(0, 10), excerpt: '', image: { src: '', x: 50, y: 50, alt: '' }, published: false, paragraphs: [''] });
    changed(); renderSide(); openPanel('post-0');
  } });
  list.push({ id: 'site', group: 'Ustawienia', label: 'Dane firmy i SEO', base: 'site', page: '', fields: SITE_FIELDS });
  return list;
}

/* ---------- Portfolio ---------- */
function renderPortfolio(panel) {
  const pf = data.portfolio;
  const addFiles = async (files) => {
    for (const file of files) {
      try {
        const src = await upload(file);
        const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        pf.items.unshift({ id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), title, category: pf.categories[0] || '', image: { src, x: 50, y: 50, alt: title } });
        openPortfolioItem = -1;
        changed({ rerender: true });
      } catch (e) { toast(e.message, true); }
    }
    updateStatus();
  };
  const drop = h('div', { class: 'drop', onclick: async () => addFiles(await pickFiles(true)) }, '⬆ Przeciągnij tu zdjęcia albo kliknij, żeby wybrać (można kilka naraz)');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('is-drop'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-drop'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('is-drop'); addFiles([...e.dataTransfer.files]); });

  const items = pf.items.map((it, i) => {
    const open = openPortfolioItem === i;
    return h('div', { class: 'pf__item' + (open ? ' is-open' : ''), 'data-path': `portfolio.items.${i}` },
      h('div', { class: 'pf__thumb', onclick: () => { openPortfolioItem = open ? -1 : i; renderPanel(); } },
        h('img', { src: media(it.image.src), alt: '', loading: 'lazy', style: `object-position:${it.image.x}% ${it.image.y}%` }), h('span', {}, it.category || '—')),
      h('div', { class: 'pf__meta' }, h('b', {}, it.title || 'Bez tytułu'), listTools('portfolio.items', i, pf.items)),
      open && h('div', { class: 'pf__edit' }, renderFields(`portfolio.items.${i}`, [
        T('title', 'Podpis'),
        { key: 'category', label: 'Kategoria', type: 'select', options: () => pf.categories.map((c) => [c, c]) },
        IMG('image', 'Zdjęcie'),
      ])));
  });

  panel.append(
    h('h2', {}, 'Portfolio'),
    h('p', { class: 'sub' }, `${pf.items.length} zdjęć · pierwsze ${data.home.portfolio.count || 6} widać na stronie głównej. Kliknij zdjęcie, żeby je edytować.`),
    drop,
    h('div', { class: 'pf' }, items),
    h('div', { style: 'margin-top:26px' }, renderFields('portfolio', [T('title', 'Tytuł podstrony'), TA('lead', 'Opis', { rows: 2 }), { key: 'categories', label: 'Kategorie (filtry)', type: 'lines' }])),
  );
}

/* ---------- Panel boczny i formularz ---------- */
function renderSide() {
  const side = $('#side'); side.textContent = '';
  let group = '';
  for (const p of panels()) {
    if (p.group !== group) { group = p.group; side.append(h('h4', {}, group)); }
    side.append(h('button', { type: 'button', class: (p.add ? 'add ' : '') + (currentPanel === p.id ? 'is-on' : ''), title: p.label, onclick: () => (p.action ? p.action() : openPanel(p.id)) }, p.label));
  }
}

function renderPanel() {
  const panelEl = $('#panel');
  const scroll = panelEl.scrollTop;
  panelEl.textContent = '';
  const p = panels().find((x) => x.id === currentPanel);
  if (!p) return;
  if (p.custom) p.custom(panelEl);
  else {
    panelEl.append(h('h2', {}, p.label), h('p', { class: 'sub' }, p.group));
    panelEl.append(...renderFields(p.base, p.fields));
    if (p.danger) panelEl.append(h('div', { class: 'danger-zone' }, h('button', { type: 'button', class: 'btn btn--small btn--danger', onclick: p.danger }, 'Usuń')));
  }
  panelEl.scrollTop = scroll;
  // Etykiety w menu mogą się zmienić (np. nazwa usługi).
  clearTimeout(renderPanel.t); renderPanel.t = setTimeout(renderSide, 300);
}

function openPanel(id, { keepPage = false } = {}) {
  currentPanel = id;
  const p = panels().find((x) => x.id === id);
  $('#panel').scrollTop = 0;
  renderSide(); renderPanel();
  if (!keepPage && p && p.page != null) { previewPath = p.page; renderPreview({ resetScroll: true }); }
  try { localStorage.setItem('raf-editor-panel', id); } catch {}
}

function panelForPath(path) {
  if (path.startsWith('portfolio.items.')) { openPortfolioItem = Number(path.split('.')[2]); return 'portfolio'; }
  const all = panels().filter((p) => p.base);
  const hit = all.filter((p) => path === p.base || path.startsWith(p.base + '.')).sort((a, b) => b.base.length - a.base.length)[0];
  return hit?.id;
}

function focusPath(path) {
  const id = panelForPath(path);
  if (!id) return;
  if (id !== currentPanel) openPanel(id, { keepPage: true }); else renderPanel();
  requestAnimationFrame(() => {
    let el = document.querySelector(`#panel [data-path="${CSS.escape(path)}"]`);
    if (!el && path.startsWith('portfolio.items.')) el = document.querySelector(`#panel [data-path="portfolio.items.${path.split('.')[2]}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    if (el.matches('input,textarea')) el.focus({ preventScroll: true });
  });
}

/* ---------- Podgląd ---------- */
const iframe = $('#preview');
const PREVIEW_HEAD = `<base href="${location.origin}${SITE_BASE}/"><script>window.RAF_PREVIEW=true</script><style>
[data-edit]{cursor:pointer}[data-edit]:hover{outline:2px dashed #2563eb;outline-offset:4px}
.reveal{opacity:1!important;transform:none!important}.is-hl{outline:3px solid #2563eb!important;outline-offset:4px}</style>`;
const PREVIEW_SCRIPT = `<script>var BASE_LEN=${SITE_BASE.length};
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-edit]');
  if(el){e.preventDefault();e.stopPropagation();parent.postMessage({type:'edit',path:el.dataset.edit},'*');return;}
  var a=e.target.closest('a');
  if(a){var h=a.getAttribute('href')||'';
    if(h.charAt(0)==='/'&&h.charAt(1)!=='/'&&!/\\.(webp|jpe?g|png|mp4)$/i.test(h)){e.preventDefault();parent.postMessage({type:'nav',path:h.slice(BASE_LEN).replace(/^\\//,'')},'*');}
    else if(h&&h.charAt(0)!=='#'){e.preventDefault();}}
},true);
document.addEventListener('submit',function(e){e.preventDefault();},true);
<\/script>`;
let previewTimer;
function schedulePreview() { clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 250); }
function renderPreview({ resetScroll = false } = {}) {
  clearTimeout(previewTimer);
  const all = routes(data, { preview: true, base: SITE_BASE });
  const route = all.find((r) => r.path === previewPath) || all[0];
  previewPath = route.path;
  $('#previewPath').textContent = '/' + route.path;
  $('#openPage').href = SITE_BASE + '/' + route.path;
  let html;
  try { html = route.render(); } catch (e) { console.error(e); return; }
  html = backend.previewHtml(html).replace('<head>', '<head>' + PREVIEW_HEAD).replace('</body>', PREVIEW_SCRIPT + '</body>');
  const y = resetScroll ? 0 : (iframe.contentWindow?.scrollY || 0);
  iframe.onload = () => { iframe.contentWindow.scrollTo(0, y); };
  iframe.srcdoc = html;
}
function highlight(path) {
  const doc = iframe.contentDocument; if (!doc) return;
  doc.querySelectorAll('.is-hl').forEach((x) => x.classList.remove('is-hl'));
  const el = doc.querySelector(`[data-edit="${CSS.escape(path)}"]`);
  if (!el) return;
  el.classList.add('is-hl');
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

addEventListener('message', (e) => {
  if (e.source !== iframe.contentWindow) return;
  if (e.data?.type === 'edit') focusPath(e.data.path);
  if (e.data?.type === 'nav') {
    previewPath = e.data.path;
    const p = panels().find((x) => x.page === previewPath && !x.add);
    if (p) openPanel(p.id); else renderPreview({ resetScroll: true });
  }
});
document.addEventListener('focusin', (e) => {
  const p = e.target.closest?.('#panel [data-path]')?.dataset.path;
  if (p) highlight(p);
});

/* ---------- Start ---------- */
document.querySelectorAll('[data-device]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('[data-device]').forEach((x) => x.classList.toggle('is-on', x === b));
  $('#previewWrap').dataset.device = b.dataset.device;
}));
saveBtn.addEventListener('click', save);
undoBtn.addEventListener('click', undo);
addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (!saveBtn.disabled) save(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.target.matches('input,textarea')) { e.preventDefault(); undo(); }
});
addEventListener('beforeunload', (e) => { if (snap() !== savedSnap || backend?.hasPending()) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- Okna logowania (tryb online) ---------- */
function modal(content) {
  const box = h('div', { class: 'modal' }, h('div', { class: 'modal__card' }, content));
  document.body.append(box);
  return box;
}
const ui = {
  _err: '', _tokErr: '',
  askLogin() {
    return new Promise((ok) => {
      const form = h('form', { class: 'modal__form', onsubmit: (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(form)); box.remove(); ok(d); } },
        h('img', { src: '../media/logo-black.png', alt: 'RAF.studio', class: 'modal__logo' }),
        h('h2', {}, 'Edytor strony'),
        h('p', { class: 'sub' }, 'Zaloguj się kontem administratora strony.'),
        ui._err && h('p', { class: 'modal__err' }, ui._err),
        h('label', {}, 'E-mail', h('input', { name: 'email', type: 'email', autocomplete: 'username', required: true })),
        h('label', {}, 'Hasło', h('input', { name: 'password', type: 'password', autocomplete: 'current-password', required: true })),
        h('button', { class: 'btn btn--primary', type: 'submit' }, 'Zaloguj'));
      ui._err = '';
      const box = modal(form);
      form.querySelector('input').focus();
    });
  },
  loginError(msg) { ui._err = msg; },
  askToken() {
    return new Promise((ok) => {
      const form = h('form', { class: 'modal__form', onsubmit: (e) => { e.preventDefault(); const v = new FormData(form).get('token'); box.remove(); ok(String(v)); } },
        h('h2', {}, 'Połącz edytor z GitHubem'),
        h('p', { class: 'sub' }, 'Jednorazowo wklej klucz dostępu do repozytorium strony. Zapisze się bezpiecznie na koncie administratora – na innych urządzeniach wystarczy już tylko zalogować się.'),
        ui._tokErr && h('p', { class: 'modal__err' }, ui._tokErr),
        h('label', {}, 'Klucz GitHub (zaczyna się od github_pat_…)', h('input', { name: 'token', type: 'password', autocomplete: 'off', required: true, spellcheck: false })),
        h('button', { class: 'btn btn--primary', type: 'submit' }, 'Połącz'));
      ui._tokErr = '';
      const box = modal(form);
      form.querySelector('input').focus();
    });
  },
  tokenError(msg) { ui._tokErr = msg; },
};

(async () => {
  try {
    backend = await createBackend(ui);
    updateStatus('Wczytywanie treści…');
    data = await backend.load();
  } catch (e) { console.error(e); updateStatus(e.message || 'Nie udało się wczytać treści', 'err'); return; }
  saveBtn.textContent = backend.saveLabel;
  if (backend.user) {
    $('.top__actions').prepend(h('button', { type: 'button', class: 'btn btn--ghost btn--small', title: 'Wyloguj', onclick: () => { if (snap() === savedSnap || confirm('Masz nieopublikowane zmiany. Wylogować mimo to?')) backend.logout(); } }, '⎋ ' + backend.user));
  }
  savedSnap = lastSnap = snap();
  let start = 'home.hero';
  try { start = localStorage.getItem('raf-editor-panel') || start; } catch {}
  if (!panels().some((p) => p.id === start && !p.add)) start = 'home.hero';
  openPanel(start);
  updateStatus();
})();

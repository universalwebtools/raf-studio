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
    h('input', { type: 'checkbox', checked: !!get(path), 'data-path': path, onchange: (e) => { set(path, e.target.checked); changed({ rerender: !!f.rerender }); } }),
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

// Punkty na zdjęciu: kliknięcie w zdjęcie dodaje punkt, punkt da się przeciągnąć.
function fieldPoints(path, f) {
  const arr = get(path) || (set(path, []), get(path));
  const image = get(f.imagePath) || {};
  const frame = h('div', { class: 'pts__frame', title: 'Kliknij, żeby dodać punkt. Przeciągnij punkt, żeby go przesunąć.' },
    h('img', { src: media(image.src), alt: '', style: `object-position:${image.x ?? 50}% ${image.y ?? 50}%`, draggable: false }));
  const pos = (e) => { const r = frame.getBoundingClientRect(); return { x: Math.round(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)) * 10) / 10, y: Math.round(Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100)) * 10) / 10 }; };
  arr.forEach((pt, i) => {
    const dot = h('span', { class: 'pts__dot', style: `left:${pt.x}%;top:${pt.y}%` }, String(i + 1));
    dot.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      dot.setPointerCapture(e.pointerId);
      const move = (ev) => { const q = pos(ev); pt.x = q.x; pt.y = q.y; dot.style.left = q.x + '%'; dot.style.top = q.y + '%'; changed(); };
      const up = () => { dot.removeEventListener('pointermove', move); dot.removeEventListener('pointerup', up); };
      dot.addEventListener('pointermove', move); dot.addEventListener('pointerup', up);
    });
    dot.addEventListener('click', (e) => e.stopPropagation());
    frame.append(dot);
  });
  frame.addEventListener('click', (e) => {
    if (!image.src) return;
    if (f.max && arr.length >= f.max) { toast(`Najwyżej ${f.max} punktów`, true); return; }
    arr.push({ ...pos(e), label: '' }); changed({ rerender: true });
  });
  return h('div', { class: 'field' }, h('div', { class: 'label' }, f.label),
    h('div', { class: 'pts' }, frame,
      h('div', { class: 'img__hint' }, image.src ? 'Kliknij na zdjęciu kolejne miejsca przelotu. Punkty można przeciągać. Linia połączy je w kolejności z listy.' : 'Najpierw wgraj zdjęcie powyżej.')),
    h('div', { class: 'list', style: 'margin-top:8px' }, arr.map((pt, i) => h('div', { class: 'list__item' },
      h('input', { type: 'text', value: pt.label || '', placeholder: `Opis ujęcia ${i + 1}`, 'data-path': `${path}.${i}.label`, oninput: (e) => { pt.label = e.target.value; changed(); } }),
      listTools(path, i, arr)))),
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
      case 'points': return fieldPoints(path, { ...f, imagePath: `${base}.${f.image}` });
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
  ['hero', 'Nagłówek z wideo', [T('kicker', 'Mały napis nad tytułem'), T('title', 'Tytuł', { max: 40 }), TA('lead', 'Opis', { rows: 3 }), T('cta', 'Tekst przycisku'), IMG('image', 'Zdjęcie (widoczne zanim wczyta się wideo)'), { type: 'note', text: 'Wideo w tle: media/hero-1080.mp4 (komputer, Full HD) i media/hero-mobile.mp4 (telefon, pionowe). To montaż najlepszych ujęć z Twoich filmów – nowy montaż przygotuję dla Ciebie.' }]],
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
  { key: 'showFilms', label: 'Pokaż na tej podstronie filmy z portfolio', type: 'checkbox' },
  T('filmCategory', 'Tylko filmy z kategorii (puste = wszystkie)', { placeholder: 'np. Eventy' }),
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
  T('email', 'E-mail', { type: 'email' }),
  T('formEmail', 'E-mail do formularza (opcjonalnie)', { type: 'email', help: 'Na ten adres trafiają zapytania z formularza. Puste = adres wyżej. Przy pierwszym zapytaniu FormSubmit wyśle na ten adres e-mail z prośbą o aktywację – trzeba kliknąć link.' }),
  T('phone', 'Telefon', { placeholder: 'np. 600 000 000' }),
  T('instagram', 'Instagram (link)', { type: 'url' }), T('facebook', 'Facebook (link)', { type: 'url' }), T('youtube', 'YouTube (link)', { type: 'url' }),
  T('gallery', 'Strefa klienta (link)', { type: 'url' }),
  T('city', 'Miasto'), T('region', 'Obszar działania (tekst)'),
  { key: 'areaServed', label: 'Obszar działania dla Google', type: 'lines' },
  T('seoTitle', 'Tytuł strony głównej w Google', { max: 65 }), TA('seoDescription', 'Opis strony głównej w Google', { rows: 3, max: 160 }),
  T('copyright', 'Tekst w stopce'),
  { type: 'note', text: 'Dane firmy do polityki prywatności (administrator danych):' },
  T('legalName', 'Pełna nazwa firmy / imię i nazwisko', { placeholder: 'np. RAF.studio Rafał Kukla' }),
  T('address', 'Adres firmy'), T('nip', 'NIP'),
  T('goatcounter', 'Statystyki GoatCounter – kod strony', { placeholder: 'np. rafstudio', help: 'Kod z adresu panelu GoatCounter (rafstudio.goatcounter.com → rafstudio). Puste = statystyki wyłączone.' }),
];

const FILM_FIELDS = [
  T('title', 'Tytuł filmu'),
  T('url', 'Link do filmu (YouTube lub Vimeo)', { type: 'url', placeholder: 'https://www.youtube.com/watch?v=…', help: 'Wklej zwykły link do filmu. Pierwszy film z listy pokazuje się też na stronie głównej.' }),
  { key: 'collection', label: 'Sekcja na stronie Filmy', type: 'select', options: () => [['', '— brak —'], ...(data.portfolio.filmCollections || []).map((c) => [c.id, c.title])] },
  T('category', 'Kategoria (np. Eventy, Reklama)', { help: 'Według kategorii filmy trafiają na podstrony usług.' }),
  IMG('image', 'Miniatura (kadr z filmu)'),
  T('file', 'Plik wideo na stronie (zamiast linku)', { placeholder: 'media/filmy/…mp4', help: 'Wypełnione = film odtwarzany prosto ze strony. Nowe pliki wideo wymagają kompresji – podeślij film, a dodam go.' }),
  { key: 'vertical', label: 'Film pionowy (rolka / reels)', type: 'checkbox' },
];

/* ---------- Widżety do dodania ---------- */
const ON = { key: 'enabled', label: 'Włączony – widoczny na stronie', type: 'checkbox', rerender: true };
const POS = { key: 'position', label: 'Miejsce na stronie głównej', type: 'select', options: [
  ['afterHero', 'Zaraz pod nagłówkiem z wideo'], ['afterAbout', 'Pod sekcją „O mnie”'], ['afterOffer', 'Pod ofertą'],
  ['afterPortfolio', 'Pod portfolio'], ['afterFilm', 'Pod filmem'], ['beforeContact', 'Na dole, nad kontaktem'],
] };
const NOTE = (text) => ({ type: 'note', text });
const IMGS = (label, itemLabel = 'Zdjęcie') => ({ key: 'items', type: 'groups', label, itemLabel, newItem: { image: { src: '', x: 50, y: 50, alt: '' } }, fields: [IMG('image', 'Zdjęcie')] });
const WIDGET_PANELS = [
  ['logos', 'Karuzela z logotypami', [ON, POS, NOTE('Pasek z nazwami/logotypami firm, z którymi współpracujesz – przesuwa się powoli w bok, zatrzymuje po najechaniu myszką. Dopóki nie wgrasz logo, widać nazwę napisaną tekstem. Najlepiej wgrywać logo w PNG z przezroczystym tłem.'),
    T('title', 'Mały napis nad paskiem'),
    { key: 'items', type: 'groups', label: 'Firmy', itemLabel: 'Firma', newItem: { name: '', image: { src: '', x: 50, y: 50, alt: '' } }, fields: [T('name', 'Nazwa firmy'), IMG('image', 'Logo (opcjonalnie)')], help: 'Wpisz tylko firmy, które zgodziły się na pokazanie ich nazwy lub logo.' }]],
  ['hscroll', 'Galeria przewijana w bok', [ON, POS, NOTE('Ciemna sekcja na cały ekran: gdy przewijasz stronę w dół, zdjęcia przesuwają się w bok. Kliknięcie powiększa zdjęcie.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), IMGS('Zdjęcia (najlepiej 6–12)')]],
  ['chapters', 'Rozdziały odsłaniane przy przewijaniu', [ON, POS, NOTE('Po lewej przyklejone zdjęcie, po prawej krótkie rozdziały. Przy przewijaniu kolejne zdjęcie „wjeżdża” od dołu. Na telefonie zdjęcia są nad tekstem.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }),
    { key: 'items', type: 'groups', label: 'Rozdziały', itemLabel: 'Rozdział', newItem: { title: '', text: '', image: { src: '', x: 50, y: 50, alt: '' } }, fields: [T('title', 'Nazwa'), TA('text', 'Tekst', { rows: 3 }), IMG('image', 'Zdjęcie')] }]],
  ['heroZoom', 'Zbliżenie nagłówka przy przewijaniu', [ON, NOTE('Wideo w nagłówku strony głównej delikatnie się przybliża i przygasa, gdy zaczynasz przewijać w dół. Bez dodatkowych ustawień.')]],
  ['beforeAfter', 'Suwak przed / po', [ON, POS, NOTE('Dwa zdjęcia nałożone na siebie – przesuwając suwak, odwiedzający widzi różnicę między surowym kadrem a gotowym zdjęciem. Przykładowe „przed” są sztucznie przygotowane – podmień je na swoje prawdziwe surowe pliki (ten sam kadr i proporcje).'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }),
    { key: 'items', type: 'groups', label: 'Porównania', itemLabel: 'Porównanie', newItem: { label: '', before: { src: '', x: 50, y: 50, alt: 'Przed obróbką' }, after: { src: '', x: 50, y: 50, alt: 'Po obróbce' } }, fields: [T('label', 'Podpis'), IMG('before', 'Zdjęcie PRZED'), IMG('after', 'Zdjęcie PO')] }]],
  ['filmHover', 'Podgląd filmu po najechaniu', [ON, NOTE('Na komputerze, gdy najedziesz myszką na miniaturę filmu, film zaczyna grać bez dźwięku jako podgląd. Kliknięcie odtwarza go normalnie. Działa w całej stronie dla filmów wgranych na stronę (nie YouTube).')]],
  ['reviews', 'Karuzela opinii (np. z Google)', [ON, POS, NOTE('Przesuwane karty z opiniami. Przykładowe wpisy to tylko miejsca do uzupełnienia – wklej prawdziwe opinie (np. skopiowane z Google) i usuń nieuzupełnione, zanim włączysz widżet.'),
    T('title', 'Tytuł'), T('link', 'Link do wszystkich opinii w Google (opcjonalnie)', { type: 'url' }),
    { key: 'items', type: 'groups', label: 'Opinie', itemLabel: 'Opinia', newItem: { text: '', author: '', stars: 5 }, fields: [TA('text', 'Treść opinii', { rows: 3 }), T('author', 'Autor'), T('stars', 'Gwiazdki (0–5, 0 = bez gwiazdek)', { type: 'number' })] }]],
  ['counters', 'Liczniki', [ON, POS, NOTE('Duże liczby, które „odliczają” od zera, gdy pojawią się na ekranie. Liczby z wyborem „automatycznie” same się aktualizują (np. gdy dodasz film).'),
    T('title', 'Tytuł (opcjonalnie)'),
    { key: 'items', type: 'groups', label: 'Liczniki', itemLabel: 'Licznik', max: 6, newItem: { label: '', auto: '', value: 0, suffix: '' }, fields: [
      T('label', 'Podpis pod liczbą'),
      { key: 'auto', label: 'Skąd liczba', type: 'select', options: [['', 'Wpiszę sam'], ['photos', 'Automatycznie: zdjęcia w portfolio'], ['films', 'Automatycznie: filmy'], ['reels', 'Automatycznie: rolki'], ['services', 'Automatycznie: usługi']] },
      T('value', 'Liczba (gdy „wpiszę sam”)', { type: 'number' }), T('suffix', 'Dopisek za liczbą (np. +)')] }]],
  ['calendar', 'Kalendarz wolnych terminów', [ON, POS, NOTE('Kilka miesięcy, zawsze od bieżącego. Dni z listy poniżej są oznaczone jako zajęte – resztę widać jako wolne. Pamiętaj, żeby aktualizować listę.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), T('months', 'Ile miesięcy pokazać', { type: 'number' }),
    { key: 'busy', label: 'Zajęte dni (format RRRR-MM-DD, np. 2027-06-12)', type: 'lines' }, T('note', 'Dopisek pod kalendarzem')]],
  ['map', 'Mapa obszaru działania', [ON, POS, NOTE('Lista miejscowości i mapa (OpenStreetMap). Mapa wczytuje się dopiero po kliknięciu „Pokaż mapę”, więc nie spowalnia strony – polityka prywatności sama dopisze o tym zdanie.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 3 }), { key: 'places', label: 'Miejscowości', type: 'lines' },
    T('lat', 'Środek mapy – szerokość geogr.', { type: 'number' }), T('lon', 'Środek mapy – długość geogr.', { type: 'number' }), T('zoom', 'Przybliżenie (5 = kraj, 10 = region, 13 = miasto)', { type: 'number' })]],
  ['marquee', 'Przesuwający się napis', [ON, POS, NOTE('Pas z bardzo dużymi słowami, które płyną w bok bez przerwy. Dobry jako mocny przerywnik między sekcjami.'),
    { key: 'items', label: 'Słowa / hasła', type: 'lines' }, { key: 'dark', label: 'Ciemne tło', type: 'checkbox' }]],
  ['spotlight', 'Wyróżniona realizacja', [ON, POS, NOTE('Jedno duże zdjęcie i krótki opis ostatniej albo najważniejszej realizacji, z przyciskiem. Przykładowe teksty podmień na swoje.'),
    T('kicker', 'Mały napis nad tytułem'), T('title', 'Tytuł'), TA('text', 'Opis', { rows: 4 }), IMG('image', 'Zdjęcie'),
    T('cta', 'Tekst przycisku'), T('link', 'Dokąd prowadzi przycisk', { placeholder: 'np. portfolio/ albo https://…', help: 'Adres podstrony (np. portfolio/, filmy/rolki/) albo pełny link.' })]],
  ['quote', 'Cytat na zdjęciu', [ON, POS, NOTE('Zdjęcie na całą szerokość z dużym zdaniem na środku. Przy przewijaniu zdjęcie przesuwa się wolniej niż strona (efekt głębi).'),
    TA('text', 'Zdanie', { rows: 2, max: 90 }), T('author', 'Podpis (opcjonalnie)'), IMG('image', 'Zdjęcie w tle')]],
  ['pricing', 'Pakiety i ceny', [ON, POS, NOTE('Karty z pakietami. Przykładowe pakiety i ceny są tylko miejscami do uzupełnienia – wpisz swoje, zanim włączysz widżet.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }),
    { key: 'items', type: 'groups', label: 'Pakiety', itemLabel: 'Pakiet', max: 4, newItem: { name: '', price: '', text: '', features: [''], featured: false }, fields: [
      T('name', 'Nazwa'), T('price', 'Cena (np. od 1500 zł)'), TA('text', 'Krótki opis', { rows: 2 }), { key: 'features', label: 'Co zawiera', type: 'lines' },
      { key: 'featured', label: 'Wyróżniony (ciemna karta)', type: 'checkbox' }] },
    T('badge', 'Napis na wyróżnionym pakiecie'), T('cta', 'Tekst przycisku'), T('note', 'Dopisek pod pakietami')]],
  ['faq', 'Pytania i odpowiedzi', [ON, POS, NOTE('Lista pytań – odpowiedź rozwija się po kliknięciu. Przykładowe odpowiedzi podmień na swoje.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }),
    { key: 'items', type: 'groups', label: 'Pytania', itemLabel: 'Pytanie', newItem: { q: '', a: '' }, fields: [T('q', 'Pytanie'), TA('a', 'Odpowiedź', { rows: 3 })] }]],
  ['insta', 'Kafelki z Instagrama', [ON, POS, NOTE('Rząd kwadratowych zdjęć z przyciskiem do Twojego profilu. Zdjęcia wybierasz sam – strona nie łączy się z Instagramem, więc nic jej nie spowalnia.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), IMGS('Zdjęcia (najlepiej 6)'),
    T('cta', 'Tekst przycisku'), T('link', 'Link do profilu', { type: 'url', help: 'Puste = link do Instagrama z „Dane firmy i SEO”.' })]],
  ['progress', 'Pasek postępu przewijania', [ON, NOTE('Cienka złota linia na samej górze ekranu, która rośnie w miarę przewijania strony. Widoczna na każdej podstronie. Bez dodatkowych ustawień.')]],
  ['notice', 'Ogłoszenie w rogu ekranu', [ON, NOTE('Mała karta w lewym dolnym rogu, na każdej podstronie – np. o wolnych terminach albo promocji. Odwiedzający może ją zamknąć i nie wraca do końca wizyty.'),
    TA('text', 'Treść ogłoszenia', { rows: 3, max: 140 }), T('cta', 'Tekst linku (opcjonalnie)'), T('link', 'Dokąd prowadzi link', { placeholder: 'np. kontakt/ albo https://…' })]],
  ['floatCta', 'Pływający przycisk kontaktu', [ON, NOTE('Przycisk przyklejony w prawym dolnym rogu, na każdej podstronie. Telefon i e-mail bierze z „Dane firmy i SEO”.'),
    T('label', 'Napis na przycisku'),
    { key: 'target', label: 'Co robi po kliknięciu', type: 'select', options: [['contact', 'Otwiera formularz kontaktowy'], ['phone', 'Dzwoni na Twój numer'], ['whatsapp', 'Otwiera rozmowę na WhatsAppie'], ['email', 'Otwiera nowy e-mail']] }]],
  ['contactSheet', 'Stykówka (pasek kliszy)', [ON, POS, NOTE('Ciemny pasek jak z kliszy fotograficznej: klatki z numerami i perforacją. Zdjęcia są czarno-białe i nabierają koloru po najechaniu. Pasek przesuwa się w bok (myszką lub palcem), kliknięcie powiększa zdjęcie.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), IMGS('Klatki (najlepiej 8–14)', 'Klatka')]],
  ['darkroom', 'Ciemnia (wywoływanie odbitek)', [ON, POS, NOTE('Ciemna sekcja w czerwonym świetle ciemni. Odbitki w białych ramkach „wywołują się” jedna po drugiej – z jasnej, rozmytej plamy do ostrego zdjęcia – gdy sekcja wjedzie na ekran.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }),
    { key: 'items', type: 'groups', label: 'Odbitki (najlepiej 3)', itemLabel: 'Odbitka', max: 6, newItem: { caption: '', image: { src: '', x: 50, y: 50, alt: '' } }, fields: [IMG('image', 'Zdjęcie'), T('caption', 'Podpis pod odbitką (opcjonalnie)')] }]],
  ['torch', 'Latarka (odsłanianie zdjęcia)', [ON, POS, NOTE('Zdjęcie jest ukryte w ciemności, a kursor działa jak latarka i odsłania je kawałek po kawałku. Na telefonie plama światła sama krąży po zdjęciu. Najlepiej działa zdjęcie z wieloma szczegółami.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), IMG('image', 'Zdjęcie')]],
  ['stack', 'Stos odbitek', [ON, POS, NOTE('Zdjęcia leżą na sobie jak odbitki na stole. Kliknięcie w stos (albo przycisk obok) odkłada wierzchnie zdjęcie na spód.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }),
    { key: 'items', type: 'groups', label: 'Odbitki (najlepiej 4–8)', itemLabel: 'Odbitka', newItem: { caption: '', image: { src: '', x: 50, y: 50, alt: '' } }, fields: [IMG('image', 'Zdjęcie'), T('caption', 'Podpis na ramce')] }]],
  ['mosaic', 'Mozaika z jednego zdjęcia', [ON, POS, NOTE('Jedno zdjęcie rozsypane na 24 kafelki. Sekcja zatrzymuje się na ekranie, a kafelki zlatują się i składają w całość w miarę przewijania.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), IMG('image', 'Zdjęcie')]],
  ['timeline', 'Oś czasu filmu', [ON, POS, NOTE('Film z paskiem scen jak w programie montażowym. Kliknięcie w scenę przeskakuje do tego momentu, a czerwona głowica pokazuje, gdzie jesteś. Przykładowe sceny mają umowne nazwy i czasy – ustaw swoje.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }),
    { key: 'film', label: 'Film', type: 'select', options: () => (data.portfolio.films || []).filter((x) => x.file).map((x) => [x.file, x.title]), help: 'Do wyboru są filmy wgrane na stronę (nie z YouTube).' },
    { key: 'scenes', type: 'groups', label: 'Sceny', itemLabel: 'Scena', max: 10, newItem: { time: '0:00', label: '' }, fields: [T('time', 'Początek sceny (minuty:sekundy, np. 0:42)'), T('label', 'Nazwa sceny')] }]],
  ['clapper', 'Klaps przed filmem', [ON, NOTE('Po kliknięciu „odtwórz” na dowolnym filmie na stronie przez sekundę widać klaps filmowy z tytułem filmu – klapnięcie i dopiero film. Działa na wszystkich podstronach. Bez dodatkowych ustawień.')]],
  ['reelWall', 'Ściana rolek', [ON, POS, NOTE('Rolki ustawione obok siebie w ramkach telefonów. Gdy sekcja jest na ekranie, grają po kolei po kilka sekund, bez dźwięku. Kliknięcie otwiera rolkę w odtwarzaczu. Rolki bierze automatycznie z listy „Filmy” (pionowe, wgrane na stronę).'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), T('count', 'Ile rolek pokazać (2–8)', { type: 'number' })]],
  ['videoBand', 'Pas z filmem w tle', [ON, POS, NOTE('Szeroki pas z cichym filmem w tle i krótkim tekstem na wierzchu. Film wczytuje się dopiero, gdy pas pojawi się na ekranie, więc nie spowalnia strony.'),
    { key: 'film', label: 'Film w tle', type: 'select', options: () => [['', 'Wideo z nagłówka strony głównej'], ...(data.portfolio.films || []).filter((x) => x.file).map((x) => [x.file, x.title])] },
    T('title', 'Tytuł'), TA('text', 'Tekst', { rows: 3 }), T('cta', 'Tekst przycisku (opcjonalnie)'), T('link', 'Dokąd prowadzi przycisk', { placeholder: 'np. filmy/ albo https://…' })]],
  ['altimeter', 'Wysokościomierz (wznoszenie drona)', [ON, POS, NOTE('Sekcja zatrzymuje się na ekranie: zdjęcie z drona zaczyna w dużym zbliżeniu i oddala się przy przewijaniu, jakby dron się wznosił, a licznik po prawej pokazuje rosnącą wysokość. Wgraj ostre zdjęcie z góry.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), IMG('image', 'Zdjęcie z drona'), T('max', 'Wysokość końcowa w metrach (np. 120)', { type: 'number' })]],
  ['flightPath', 'Trasa lotu', [ON, POS, NOTE('Na zdjęciu z góry rysuje się linia przelotu drona z ponumerowanymi ujęciami; pod spodem lista z opisami. Przykładowe punkty i opisy są umowne – ustaw je według prawdziwego lotu.'),
    T('title', 'Tytuł'), TA('lead', 'Opis', { rows: 2 }), IMG('image', 'Zdjęcie z góry'),
    { key: 'points', type: 'points', label: 'Punkty trasy', image: 'image', max: 12 }]],
  ['cursor', 'Kursor-celownik', [ON, NOTE('Na komputerze strzałka myszki zamienia się w ramkę wizjera aparatu. Nad zdjęciem lub filmem ramka zmniejsza się i robi zielona, jakby łapała ostrość. Na telefonach nic się nie zmienia. Działa na wszystkich podstronach. Bez dodatkowych ustawień.')]],
  ['shutter', 'Migawka między podstronami', [ON, NOTE('Przy przejściu z jednej podstrony na drugą ekran na ułamek sekundy zamyka się i otwiera jak migawka aparatu. Działa na wszystkich podstronach. Bez dodatkowych ustawień.')]],
  ['toTop', 'Przycisk „do góry”', [ON, NOTE('Okrągły przycisk ze strzałką w prawym dolnym rogu. Pojawia się po przewinięciu strony w dół i wraca na samą górę. Bez dodatkowych ustawień.')]],
];

// Treść startowa nowych widżetów (gdy nie ma ich jeszcze w zapisanej treści strony).
const PIC = (name, alt) => ({ src: `media/portfolio/${name}.webp`, small: `media/portfolio/${name}-800.webp`, x: 50, y: 50, alt });
const WIDGET_DEFAULTS = {
  marquee: { position: 'afterAbout', dark: false, items: ['Fotografia', 'Film', 'Dron', 'Śluby', 'Eventy', 'Reklama'] },
  spotlight: { position: 'afterPortfolio', kicker: 'Ostatnia realizacja', title: 'Tu wpisz nazwę realizacji', text: 'Dwa–trzy zdania o tym, co to była za realizacja, dla kogo i co było w niej najważniejsze.', image: PIC('slub-129', 'Para młoda podczas sesji ślubnej'), cta: 'Zobacz portfolio', link: 'portfolio/' },
  quote: { position: 'afterFilm', text: 'Obraz, który zostaje.', author: 'RAF.studio', image: PIC('zareczyny-51', 'Para w złotym świetle') },
  pricing: { position: 'afterOffer', title: 'Pakiety', lead: 'Każdą realizację wyceniam indywidualnie – to punkty wyjścia.', badge: 'Najczęściej wybierany', cta: 'Zapytaj o termin', note: 'Ceny orientacyjne. Dokładną wycenę przygotuję po krótkiej rozmowie.', items: [
    { name: 'Sesja', price: 'od … zł', text: 'Tu wpisz, dla kogo jest ten pakiet.', features: ['Tu wpisz, co zawiera', 'Kolejny punkt', 'Kolejny punkt'], featured: false },
    { name: 'Reportaż', price: 'od … zł', text: 'Tu wpisz, dla kogo jest ten pakiet.', features: ['Tu wpisz, co zawiera', 'Kolejny punkt', 'Kolejny punkt'], featured: true },
    { name: 'Foto + film', price: 'od … zł', text: 'Tu wpisz, dla kogo jest ten pakiet.', features: ['Tu wpisz, co zawiera', 'Kolejny punkt', 'Kolejny punkt'], featured: false }] },
  faq: { position: 'beforeContact', title: 'Częste pytania', lead: '', items: [
    { q: 'Jak zarezerwować termin?', a: 'Tu wpisz odpowiedź – np. jak wygląda rezerwacja i czy potrzebna jest umowa lub zadatek.' },
    { q: 'Kiedy dostanę zdjęcia lub film?', a: 'Tu wpisz odpowiedź – np. ile trwa obróbka i w jakiej formie oddajesz materiał.' },
    { q: 'Czy dojeżdżasz poza Bielsko-Białą?', a: 'Tu wpisz odpowiedź – np. gdzie pracujesz i jak rozliczasz dojazd.' },
    { q: 'Czy mogę zamówić zdjęcia i film razem?', a: 'Tu wpisz odpowiedź.' }] },
  insta: { position: 'beforeContact', title: 'Na bieżąco na Instagramie', lead: '', cta: 'Zobacz na Instagramie', link: '', items: [
    { image: PIC('slub-00', 'Para młoda i samochód ślubny') }, { image: PIC('zareczyny-38', 'Sesja zaręczynowa') }, { image: PIC('panienski-02', 'Wieczór panieński') },
    { image: PIC('audi-00', 'Sesja samochodu') }, { image: PIC('fitness-07', 'Sesja fitness') }, { image: PIC('produkt-31', 'Zdjęcie produktowe') }] },
  contactSheet: { position: 'afterPortfolio', title: 'Stykówka', lead: 'Kilka klatek z ostatnich realizacji. Przesuń pasek w bok, kliknij klatkę, żeby ją powiększyć.', items: [
    ['slub-00', 'Para młoda i samochód ślubny'], ['slub-21', 'Ślub'], ['slub-36', 'Ślub'], ['zareczyny-51', 'Para w złotym świetle'], ['panienski-06', 'Wieczór panieński'],
    ['audi-08', 'Sesja samochodu'], ['fitness-14', 'Sesja fitness'], ['groomer-07', 'Salon groomerski'], ['osp-01', 'Straż pożarna'], ['slub-105', 'Ślub']].map(([n, alt]) => ({ image: PIC(n, alt) })) },
  darkroom: { position: 'afterAbout', title: 'Prosto z ciemni', lead: 'Każde zdjęcie potrzebuje chwili, żeby się pojawić.', items: [
    { image: PIC('slub-78', 'Ślub'), caption: '' }, { image: PIC('zareczyny-38', 'Sesja zaręczynowa'), caption: '' }, { image: PIC('panienski-11', 'Wieczór panieński'), caption: '' }] },
  torch: { position: 'afterFilm', title: 'Poszukaj kadru', lead: 'Przesuń kursor po zdjęciu.', image: PIC('slub-153', 'Zdjęcie ślubne') },
  stack: { position: 'afterPortfolio', title: 'Odbitki na stole', lead: 'Kliknij stos, żeby zobaczyć następne zdjęcie.', items: [
    ['slub-138', 'Ślub'], ['zareczyny-51', 'Zaręczyny'], ['panienski-15', 'Wieczór panieński'], ['audi-16', 'Motoryzacja'], ['fitness-28', 'Sesja'], ['produkt-36', 'Produkt']].map(([n, c]) => ({ image: PIC(n, c), caption: c })) },
  mosaic: { position: 'afterOffer', title: 'Kadr składa się z detali', lead: '', image: PIC('slub-87', 'Zdjęcie ślubne') },
  timeline: { position: 'afterFilm', title: 'Film scena po scenie', lead: 'Kliknij scenę, żeby do niej przeskoczyć.', film: 'media/filmy/lato-jasienica-podsumowanie.mp4', scenes: [
    { time: '0:00', label: 'Otwarcie' }, { time: '0:20', label: 'Scena 2' }, { time: '0:42', label: 'Scena 3' }, { time: '1:05', label: 'Finał' }] },
  reelWall: { position: 'afterFilm', title: 'Rolki', lead: 'Krótkie, pionowe formy do mediów społecznościowych.', count: 5 },
  videoBand: { position: 'afterOffer', film: '', title: 'Historie w ruchu', text: 'Tu wpisz jedno–dwa zdania o swoich filmach.', cta: 'Zobacz filmy', link: 'filmy/' },
  altimeter: { position: 'afterOffer', title: 'Perspektywa z góry', lead: 'Przewijaj – dron się wznosi.', image: { src: 'media/uslugi-dron.webp', x: 50, y: 50, alt: 'Ujęcie z drona' }, max: 120 },
  flightPath: { position: 'afterFilm', title: 'Trasa jednego lotu', lead: 'Tak wygląda plan przelotu – każdy punkt to osobne ujęcie.', image: { src: 'media/uslugi-dron.webp', x: 50, y: 50, alt: 'Ujęcie z drona' }, points: [
    { x: 14, y: 72, label: 'Start i wznoszenie' }, { x: 34, y: 40, label: 'Przelot nad terenem' }, { x: 58, y: 56, label: 'Okrążenie głównego obiektu' }, { x: 82, y: 30, label: 'Odjazd i szeroki plan' }] },
  notice: { text: 'Tu wpisz krótkie ogłoszenie, np. o wolnych terminach.', cta: 'Zapytaj o termin', link: 'kontakt/' },
  floatCta: { label: 'Napisz do mnie', target: 'contact' },
};
// Jak pokazać widżet w podglądzie zaraz po kliknięciu: przewinięcie do konkretnego miejsca (px)
// zamiast do samego widżetu – dla efektów, które nie są osobną sekcją.
const WIDGET_VIEW = { heroZoom: { scroll: 320, smooth: true }, progress: { scroll: 900, smooth: true }, toTop: { scroll: 900, smooth: true }, notice: { scroll: 0 }, floatCta: { scroll: 0 }, filmHover: { scroll: 0 }, clapper: { scroll: 0 }, cursor: { scroll: 0 }, shutter: { scroll: 0 } };
const WIDGET_HINT = {
  heroZoom: 'Podgląd sam przewinął stronę kawałek w dół – przewiń w górę i w dół, żeby zobaczyć zbliżenie.',
  filmHover: 'Najedź myszką na miniaturę filmu w podglądzie.',
  progress: 'Złota linia jest na samej górze podglądu – przewijaj, żeby zobaczyć, jak rośnie.',
  toTop: 'Przycisk jest w prawym dolnym rogu podglądu.',
  notice: 'Ogłoszenie jest w lewym dolnym rogu podglądu.',
  floatCta: 'Przycisk jest w prawym dolnym rogu podglądu.',
  clapper: 'Podgląd pokazał klaps na pierwszym filmie. Kliknij miniaturę dowolnego filmu w podglądzie, żeby zobaczyć go jeszcze raz.',
  cursor: 'Przesuń myszkę nad podgląd – najedź na zdjęcie i na przycisk.',
  shutter: 'Podgląd pokazał migawkę raz. Kliknij „Pokaż w podglądzie”, żeby zobaczyć ją ponownie.',
  torch: 'Przesuń myszkę po ciemnym zdjęciu w podglądzie.',
  mosaic: 'Przewijaj podgląd w dół – kafelki złożą się w zdjęcie.',
  altimeter: 'Przewijaj podgląd w dół – kadr się oddala, a licznik rośnie.',
  timeline: 'Kliknij scenę na pasku w podglądzie.',
};

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
  list.push({ id: 'film-collections', group: 'Portfolio', label: 'Sekcje filmów', base: 'portfolio.filmCollections', page: 'filmy/', fields: [
    { key: '', type: 'groups', label: 'Sekcje', itemLabel: 'Sekcja', newItem: { id: 'nowa-sekcja', title: 'Nowa sekcja', lead: '', vertical: false, photoCategory: '' }, fields: [
      T('title', 'Nazwa'), TA('lead', 'Opis', { rows: 2 }), T('id', 'Adres', { slug: true, help: 'raf-studio.pl/filmy/…/' }),
      { key: 'vertical', label: 'Filmy pionowe (rolki)', type: 'checkbox' },
      { key: 'photoCategory', label: 'Pokaż też zdjęcia z kategorii', type: 'select', options: () => [['', '— brak —'], ...data.portfolio.categories.map((c) => [c, c])] },
    ] },
  ] });
  list.push({ id: 'films', group: 'Portfolio', label: 'Filmy', base: 'portfolio.films', page: 'filmy/', fields: [
    { key: '', type: 'groups', label: 'Filmy', itemLabel: 'Film', newItem: { title: '', url: '', category: '', image: { src: '', x: 50, y: 50, alt: '' } }, fields: FILM_FIELDS,
      help: 'Filmy pojawiają się w portfolio, na podstronie „Historie w ruchu” i (pierwszy) na stronie głównej. Odtwarzacz wczytuje się dopiero po kliknięciu.' },
  ] });
  data.blog.forEach((p, i) => list.push({
    id: `post-${i}`, group: 'Dziennik', label: (p.published ? '' : '◌ ') + (p.title || 'Nowy wpis'), base: `blog.${i}`, page: `blog/${p.slug}/`, fields: POST_FIELDS,
    danger: () => { if (confirm(`Usunąć wpis „${p.title}”?`)) { data.blog.splice(i, 1); changed({ rerender: true }); renderSide(); openPanel('home.journal'); } },
  }));
  list.push({ id: 'post-add', group: 'Dziennik', label: '+ Nowy wpis', add: true, action: () => {
    data.blog.unshift({ slug: `nowy-wpis-${Date.now().toString(36)}`, title: 'Nowy wpis', date: new Date().toISOString().slice(0, 10), excerpt: '', image: { src: '', x: 50, y: 50, alt: '' }, published: false, paragraphs: [''] });
    changed(); renderSide(); openPanel('post-0');
  } });
  if (!data.widgets) data.widgets = {};
  for (const [key, label, fields] of WIDGET_PANELS) {
    if (!data.widgets[key]) data.widgets[key] = { enabled: false, ...structuredClone(WIDGET_DEFAULTS[key] || {}) };
    if (data.widgets[key].removed) continue;
    const on = !!data.widgets[key].enabled;
    list.push({ id: `widget-${key}`, group: 'Widżety do dodania', label: (on ? '● ' : '○ ') + label, title: label, base: `widgets.${key}`, page: key === 'filmHover' || key === 'clapper' ? 'filmy/' : '', fields, widget: key,
      remove: () => removeWidget(key, label) });
  }
  const gone = WIDGET_PANELS.filter(([key]) => data.widgets[key]?.removed);
  if (gone.length) list.push({ id: 'widgets-removed', group: 'Widżety do dodania', label: `↺ Usunięte (${gone.length})`, title: 'Usunięte widżety', custom: renderRemovedWidgets });
  list.push({ id: 'site', group: 'Ustawienia', label: 'Dane firmy i SEO', base: 'site', page: '', fields: SITE_FIELDS });
  return list;
}

/* ---------- Usuwanie widżetów z listy ---------- */
function removeWidget(key, label) {
  const w = data.widgets[key];
  const live = w.enabled ? '\n\nTen widżet jest teraz WŁĄCZONY – po opublikowaniu zniknie też ze strony.' : '';
  if (!confirm(`Usunąć widżet „${label}” z listy?${live}\n\nW razie czego przywrócisz go z pozycji „Usunięte” na dole listy widżetów.`)) return;
  commitHistory();
  const ids = panels().filter((p) => p.widget).map((p) => p.id);
  const at = ids.indexOf(`widget-${key}`);
  w.removed = true; w.enabled = false;
  changed();
  commitHistory();
  if (currentPanel === `widget-${key}`) openPanel(ids[at + 1] || ids[at - 1] || 'widgets-removed');
  else { renderSide(); renderPreview(); }
  toast(`Usunięto z listy: ${label}`);
}
function restoreWidget(key, label) {
  commitHistory();
  delete data.widgets[key].removed;
  changed();
  commitHistory();
  openPanel(`widget-${key}`);
  toast(`Przywrócono: ${label}`);
}
function renderRemovedWidgets(panel) {
  const gone = WIDGET_PANELS.filter(([key]) => data.widgets[key]?.removed);
  panel.append(
    h('h2', {}, 'Usunięte widżety'),
    h('p', { class: 'sub' }, 'Widżety, które odrzuciłeś. Przywrócony widżet wraca na listę wyłączony, z zachowaną treścią.'),
    h('div', { class: 'list' }, gone.map(([key, label, fields]) => h('div', { class: 'list__item is-group gone' },
      h('div', {}, h('b', {}, label), h('div', { class: 'help' }, fields.find((f) => f.type === 'note')?.text || '')),
      h('button', { type: 'button', class: 'btn btn--small', onclick: () => restoreWidget(key, label) }, '↺ Przywróć')))),
  );
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
    const btn = h('button', { type: 'button', class: (p.add ? 'add ' : '') + (currentPanel === p.id ? 'is-on' : ''), title: p.title || p.label, onclick: () => (p.action ? p.action() : openPanel(p.id)) }, p.label);
    side.append(p.remove
      ? h('div', { class: 'side__row' }, btn, h('button', { type: 'button', class: 'side__del', title: `Usuń „${p.title}” z listy`, 'aria-label': `Usuń widżet „${p.title}” z listy`, onclick: p.remove }, '✕'))
      : btn);
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
    panelEl.append(h('h2', {}, p.title || p.label), h('p', { class: 'sub' }, p.group));
    if (p.widget) {
      const on = !!data.widgets[p.widget].enabled;
      panelEl.append(h('div', { class: 'wg-note' + (on ? ' is-on' : '') },
        h('div', {}, h('b', {}, on ? 'Włączony.' : 'Podgląd na próbę.'), ' ',
          on ? 'Po prawej widzisz go tak, jak na stronie.' : 'Po prawej widzisz, jak ten widżet będzie wyglądał. Na stronie pojawi się dopiero, gdy zaznaczysz „Włączony” i opublikujesz.',
          WIDGET_HINT[p.widget] ? ' ' + WIDGET_HINT[p.widget] : ''),
        h('div', { class: 'wg-note__row' },
          h('button', { type: 'button', class: 'btn btn--small', onclick: () => { previewPath = p.page; renderPreview({ focus: true }); } }, '◎ Pokaż w podglądzie'),
          h('button', { type: 'button', class: 'btn btn--small btn--danger', onclick: p.remove }, '✕ Usuń z listy'))));
    }
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
  if (!keepPage && p && p.page != null) { previewPath = p.page; renderPreview({ resetScroll: true, focus: !!p.widget }); }
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
.reveal{opacity:1!important;transform:none!important}.is-hl{outline:3px solid #2563eb!important;outline-offset:4px}
section[data-wg-off]{position:relative;outline:2px dashed #b8925a;outline-offset:-2px}
section[data-wg-off]::before{content:"Podgląd na próbę – widżet jest wyłączony";position:absolute;top:12px;left:12px;z-index:6;padding:5px 11px;border-radius:99px;background:#b8925a;color:#fff;font:600 12px/1.3 Inter,system-ui,sans-serif;letter-spacing:0;text-transform:none;pointer-events:none}
.wg-notice[data-wg-off],.wg-fab[data-wg-off],.wg-top[data-wg-off]{outline:2px dashed #b8925a;outline-offset:3px}</style>`;
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
// Odstęp od góry przy przewijaniu podglądu do widżetu (wysokość przyklejonego menu strony).
const PREVIEW_TOP = 76;
function renderPreview({ resetScroll = false, focus = false } = {}) {
  clearTimeout(previewTimer);
  // Otwarty panel widżetu = widżet widoczny w podglądzie, nawet gdy jest wyłączony.
  const showWidget = panels().find((x) => x.id === currentPanel)?.widget || '';
  const all = routes(data, { preview: true, base: SITE_BASE, showWidget });
  const route = all.find((r) => r.path === previewPath) || all[0];
  previewPath = route.path;
  $('#previewPath').textContent = '/' + route.path;
  $('#openPage').href = SITE_BASE + '/' + route.path;
  let html;
  try { html = route.render(); } catch (e) { console.error(e); return; }
  html = backend.previewHtml(html).replace('<head>', '<head>' + PREVIEW_HEAD).replace('</body>', PREVIEW_SCRIPT + '</body>');
  const y = resetScroll ? 0 : (iframe.contentWindow?.scrollY || 0);
  const view = focus && showWidget ? (WIDGET_VIEW[showWidget] || {}) : null;
  iframe.onload = () => {
    const win = iframe.contentWindow, doc = iframe.contentDocument;
    if (!view) { win.scrollTo(0, y); return; }
    if (view.scroll != null) {
      win.scrollTo({ top: 0, behavior: 'instant' });
      if (view.scroll) setTimeout(() => { if (iframe.contentWindow === win) win.scrollTo({ top: view.scroll, behavior: view.smooth ? 'smooth' : 'instant' }); }, 350);
      return;
    }
    const el = doc.querySelector(`[data-wg="${showWidget}"]`);
    if (!el) { win.scrollTo(0, y); return; }
    // Do widżetu od razu; potem poprawki, bo doczytujące się zdjęcia przesuwają układ strony.
    let touched = false;
    for (const ev of ['wheel', 'touchstart', 'keydown', 'mousedown']) win.addEventListener(ev, () => { touched = true; }, { passive: true, once: true });
    const go = () => { if (!touched && iframe.contentDocument === doc && el.isConnected) win.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + win.scrollY - PREVIEW_TOP), behavior: 'instant' }); };
    go();
    for (const ms of [300, 900, 1800]) setTimeout(go, ms);
  };
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
  panels(); // uzupełnia brakujące widżety, zanim zapamiętamy stan „zapisany”
  savedSnap = lastSnap = snap();
  let start = 'home.hero';
  try { start = localStorage.getItem('raf-editor-panel') || start; } catch {}
  if (!panels().some((p) => p.id === start && !p.add)) start = 'home.hero';
  openPanel(start);
  updateStatus();
})();

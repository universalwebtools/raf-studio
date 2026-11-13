// Szablony strony RAF.studio.
// Ten sam plik działa w Node (build.mjs) i w przeglądarce (podgląd w edytorze),
// więc nie może importować niczego z Node.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
export const formatDate = (iso) => {
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? '' : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// BASE: prefiks adresów – pusty na raf-studio.pl, np. '/raf-studio-podglad' na stronie testowej.
let BASE = '';
// Wersja plików CSS/JS – zmienia się przy każdej zmianie, żeby przeglądarki nie używały starych kopii.
let ASSET_V = '';
const asset = (p) => url(p) + (ASSET_V ? `?v=${ASSET_V}` : '');
const abs = (p) => '/' + String(p || '').replace(/^\/+/, '');
const url = (p) => BASE + abs(p);

// Atrybut łączący element podglądu z polem w edytorze (tylko w trybie podglądu).
const ed = (ctx, path) => (ctx.preview && path ? ` data-edit="${esc(path)}"` : '');

function img(ctx, image, { path = '', cls = '', sizes = '', eager = false } = {}) {
  if (!image || !image.src) return `<div class="ph ${cls}"${ed(ctx, path)}></div>`;
  const x = image.x ?? 50, y = image.y ?? 50;
  // image.small: mniejsza wersja (800 px) do siatek – przeglądarka sama wybierze rozmiar.
  const srcset = image.small ? ` srcset="${esc(url(image.small))} 800w, ${esc(url(image.src))} 2000w" sizes="${sizes || '100vw'}"` : (sizes ? ` sizes="${sizes}"` : '');
  return `<img class="${cls}" src="${esc(url(image.small || image.src))}"${srcset} alt="${esc(image.alt || '')}" style="object-position:${x}% ${y}%"` +
    `${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${ed(ctx, path)}>`;
}

const paras = (ctx, list, path) => (list || []).map((p, i) => `<p${ed(ctx, `${path}.${i}`)}>${esc(p)}</p>`).join('');

/* ---------- Wspólne elementy ---------- */

function header(ctx, { overlay }) {
  const { site } = ctx.data;
  const links = [
    ['uslugi/', 'Oferta'],
    ['portfolio/', 'Portfolio'],
    ...((ctx.data.portfolio.films || []).length ? [['filmy/', 'Filmy']] : []),
    ['o-mnie/', 'O mnie'],
    ['blog/', 'Dziennik'],
    ['kontakt/', 'Kontakt'],
  ];
  const cur = ctx.path;
  return `<header class="hdr${overlay ? ' hdr--overlay' : ''}" data-hdr>
  <div class="wrap hdr__in">
    <a class="hdr__logo" href="${url(``)}" aria-label="${esc(site.name)} – strona główna">
      <img class="logo-light" src="${esc(url(site.logoLight))}" alt="${esc(site.name)}" width="120" height="39">
      <img class="logo-dark" src="${esc(url(site.logoDark))}" alt="" width="120" height="39" aria-hidden="true">
    </a>
    <button class="hdr__burger" type="button" aria-label="Menu" aria-expanded="false" data-burger><span></span><span></span></button>
    <nav class="hdr__nav" aria-label="Główne menu">
      ${links.map(([href, label]) => `<a href="${url(href)}"${cur.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
      ${site.gallery ? `<a class="hdr__client" href="${esc(site.gallery)}" rel="noopener">Strefa klienta</a>` : ''}
    </nav>
  </div>
</header>`;
}

function footer(ctx) {
  const { site, services } = ctx.data;
  const social = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['youtube', 'YouTube']].filter(([k]) => site[k]);
  return `<footer class="ftr">
  <div class="wrap ftr__grid">
    <div>
      <img src="${esc(url(site.logoLight))}" alt="${esc(site.name)}" width="130" height="42" loading="lazy">
      <p class="ftr__tag">${esc(site.tagline)}</p>
      <p class="ftr__region"${ed(ctx, 'site.region')}>${esc(site.region)}</p>
    </div>
    <div>
      <h3>Oferta</h3>
      <ul>${services.map((s) => `<li><a href="${url(`uslugi/${esc(s.slug)}/`)}">${esc(s.title)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h3>Kontakt</h3>
      <ul>
        ${site.email ? `<li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>` : ''}
        ${site.phone ? `<li><a href="tel:${esc(site.phone.replace(/\s/g, ''))}">${esc(site.phone)}</a></li>` : ''}
        ${social.map(([k, l]) => `<li><a href="${esc(site[k])}" rel="noopener">${l}</a></li>`).join('')}
        ${site.gallery ? `<li><a href="${esc(site.gallery)}" rel="noopener">Strefa klienta</a></li>` : ''}
      </ul>
    </div>
  </div>
  <div class="wrap ftr__bottom">
    <span${ed(ctx, 'site.copyright')}>${esc(site.copyright)}</span>
    <a href="${url(`polityka-prywatnosci/`)}">Polityka prywatności</a>
  </div>
</footer>`;
}

// Formularz wysyłany przez FormSubmit.co na adres z ustawień (działa też bez JavaScriptu).
function contactForm(ctx) {
  const { site, services } = ctx.data;
  const to = site.formEmail || site.email;
  if (!to) return '';
  const thanks = site.url.replace(/\/$/, '') + '/kontakt/dziekujemy/';
  return `<form class="form" method="POST" action="https://formsubmit.co/${esc(to)}" data-contact-form data-endpoint="https://formsubmit.co/ajax/${esc(to)}">
      <input type="hidden" name="_subject" value="Nowe zapytanie ze strony ${esc(site.name)}">
      <input type="hidden" name="_template" value="table">
      <input type="hidden" name="_captcha" value="false">
      <input type="hidden" name="_next" value="${esc(thanks)}">
      <div class="form__hp" aria-hidden="true"><label>Nie wypełniaj<input name="_honey" tabindex="-1" autocomplete="off"></label></div>
      <label>Twoje imię<input name="Imię" autocomplete="name" required maxlength="100"></label>
      <div class="form__row">
        <label>Adres e-mail<input name="email" type="email" autocomplete="email" required maxlength="150"></label>
        <label>Telefon <small>(opcjonalnie)</small><input name="Telefon" type="tel" autocomplete="tel" maxlength="30"></label>
      </div>
      <div class="form__row">
        <label>Interesuje mnie<select name="Usługa">${services.map((s) => `<option>${esc(s.title)}</option>`).join('')}<option>Coś innego</option></select></label>
        <label>Planowany termin<input name="Termin" type="date"></label>
      </div>
      <label>Kilka słów o pomyśle<textarea name="Wiadomość" rows="4" required maxlength="5000"></textarea></label>
      <label class="form__consent"><input type="checkbox" required> <span>Zgadzam się na wykorzystanie moich danych do odpowiedzi na zapytanie. Więcej w <a href="${url(`polityka-prywatnosci/`)}">polityce prywatności</a>.</span></label>
      <button class="btn btn--dark" type="submit">Wyślij zapytanie</button>
      <p class="form__status" role="status" aria-live="polite"></p>
    </form>`;
}

function contactBlock(ctx, { heading = true } = {}) {
  const { site, home } = ctx.data;
  const c = home.contact;
  return `<section class="contact" id="kontakt">
  <div class="wrap contact__grid">
    <div class="contact__copy">
      ${heading ? `<p class="kicker"${ed(ctx, 'home.contact.kicker')}>${esc(c.kicker)}</p>
      <h2${ed(ctx, 'home.contact.title')}>${esc(c.title)}</h2>` : ''}
      <p class="lead"${ed(ctx, 'home.contact.text')}>${esc(c.text)}</p>
      <ul class="contact__list">
        ${site.email ? `<li><span>E-mail</span><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>` : ''}
        ${site.phone ? `<li><span>Telefon</span><a href="tel:${esc(site.phone.replace(/\s/g, ''))}">${esc(site.phone)}</a></li>` : ''}
        <li><span>Obszar</span>${esc(site.region)}</li>
      </ul>
    </div>
    ${contactForm(ctx)}
  </div>
</section>`;
}

function serviceCards(ctx) {
  return `<div class="cards">${ctx.data.services.map((s, i) => `
    <a class="card" href="${url(`uslugi/${esc(s.slug)}/`)}">
      <div class="card__img">${img(ctx, s.image, { path: `services.${i}.image`, sizes: '(max-width:700px) 100vw, 33vw' })}</div>
      <div class="card__body">
        <h3${ed(ctx, `services.${i}.title`)}>${esc(s.title)}</h3>
        <p${ed(ctx, `services.${i}.short`)}>${esc(s.short)}</p>
        <span class="more">Więcej o realizacji →</span>
      </div>
    </a>`).join('')}</div>`;
}

function portfolioGrid(ctx, items, { filters = false } = {}) {
  const { portfolio } = ctx.data;
  const cats = portfolio.categories.filter((c) => items.some((it) => it.category === c));
  return `${filters && cats.length > 1 ? `<div class="filters" role="tablist">
      <button type="button" class="is-on" data-filter="*">Wszystkie</button>
      ${cats.map((c) => `<button type="button" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>` : ''}
    <div class="grid" data-lightbox>${items.map((it) => {
      const idx = portfolio.items.indexOf(it);
      return `<figure class="grid__item" data-cat="${esc(it.category)}">
        <a href="${esc(url(it.image?.src))}" data-lb>${img(ctx, it.image, { path: `portfolio.items.${idx}.image`, sizes: '(max-width:700px) 100vw, 33vw' })}</a>
        <figcaption><span${ed(ctx, `portfolio.items.${idx}.title`)}>${esc(it.title)}</span><small>${esc(it.category)}</small></figcaption>
      </figure>`;
    }).join('')}</div>`;
}

/* ---------- Filmy (YouTube / Vimeo, wczytywane dopiero po kliknięciu) ---------- */
export function videoInfo(link) {
  const s = String(link || '').trim();
  let m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return { type: 'youtube', id: m[1], embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&modestbranding=1`, thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` };
  m = s.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([\da-f]+))?/);
  if (m) return { type: 'vimeo', id: m[1], embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1&dnt=1${m[2] ? `&h=${m[2]}` : ''}`, thumb: '' };
  return null;
}

// Film z pliku na stronie (media/filmy/…) albo z YouTube/Vimeo.
const filmSource = (f) => (f.file ? { type: 'file', src: f.file, thumb: '' } : videoInfo(f.url));

function filmCard(ctx, f, { large = false } = {}) {
  const i = ctx.data.portfolio.films.indexOf(f);
  const v = filmSource(f);
  if (!v) return '';
  const play = v.type === 'file'
    ? `data-video="${esc(url(v.src))}"${f.image?.src ? ` data-poster="${esc(url(f.image.src))}"` : ''}`
    : `data-embed="${esc(v.embed)}"`;
  const poster = f.image?.src
    ? img(ctx, f.image, { path: `portfolio.films.${i}.image`, sizes: large ? '(max-width:800px) 100vw, 50vw' : '(max-width:700px) 100vw, 33vw' })
    : v.thumb ? `<img src="${esc(v.thumb)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '<div class="ph"></div>';
  const hover = v.type === 'file' && wgOn(ctx, 'filmHover') ? ` data-wg-hover="${esc(url(v.src))}"` : '';
  return `<figure class="film${large ? ' film--large' : ''}${f.vertical ? ' film--vertical' : ''}"${hover}>
    <button type="button" class="film__play" ${play} aria-label="Odtwórz film: ${esc(f.title)}">
      ${poster}<span class="film__icon" aria-hidden="true"></span>
    </button>
    <figcaption><strong${ed(ctx, `portfolio.films.${i}.title`)}>${esc(f.title)}</strong>${f.category ? `<small>${esc(f.category)}</small>` : ''}</figcaption>
  </figure>`;
}

const filmsGrid = (ctx, films, { reels = false } = {}) => `<div class="films${reels ? ' films--reels' : ''}">${films.map((f) => filmCard(ctx, f)).join('')}</div>
  ${films.some((f) => !f.file) ? '<p class="films__note">Filmy z YouTube i Vimeo wczytują się dopiero po kliknięciu.</p>' : ''}`;

const visibleFilms = (data) => (data.portfolio.films || []).filter((f) => filmSource(f));

/* ---------- Kolekcje filmów (rolki, gmina, straż, reklama) ---------- */
const collections = (data) => (data.portfolio.filmCollections || []).filter((c) => visibleFilms(data).some((f) => f.collection === c.id));
const collectionFilms = (data, id) => visibleFilms(data).filter((f) => f.collection === id);

function collectionBlock(ctx, c, { limit = 0, alt = false } = {}) {
  const all = collectionFilms(ctx.data, c.id);
  const films = limit ? all.slice(0, limit) : all;
  const i = ctx.data.portfolio.filmCollections.indexOf(c);
  return `<section class="section${alt ? ' section--alt' : ''}" id="${esc(c.id)}">
  <div class="wrap">
    <div class="section__head section__head--row">
      <div><h2${ed(ctx, `portfolio.filmCollections.${i}.title`)}>${esc(c.title)}</h2>${c.lead ? `<p class="lead"${ed(ctx, `portfolio.filmCollections.${i}.lead`)}>${esc(c.lead)}</p>` : ''}</div>
      ${limit && all.length > films.length ? `<a class="btn btn--dark" href="${url(`filmy/${c.id}/`)}">Wszystkie (${all.length})</a>` : ''}
    </div>
    ${c.vertical ? reelLinks(ctx, c, films) : filmsGrid(ctx, films)}
  </div>
</section>`;
}

/* ---------- Rolki w stylu „Shorts”: jeden film na ekran, przewijanie = następny ---------- */
const reelId = (f) => String(f.file || f.url || f.title).split('/').pop().replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-');

// Miniatury rolek prowadzące do odtwarzacza na właściwym filmie.
function reelLinks(ctx, c, films) {
  return `<div class="films films--reels">${films.map((f) => {
    const i = ctx.data.portfolio.films.indexOf(f);
    return `<a class="film film--vertical film--link" href="${url(`filmy/${c.id}/`)}#${esc(reelId(f))}" aria-label="Oglądaj rolkę: ${esc(f.title)}">
      <span class="film__play">${f.image?.src ? img(ctx, f.image, { path: `portfolio.films.${i}.image`, sizes: '(max-width:700px) 50vw, 240px' }) : '<span class="ph"></span>'}<span class="film__icon" aria-hidden="true"></span></span>
      <span class="film__cap"><strong${ed(ctx, `portfolio.films.${i}.title`)}>${esc(f.title)}</strong></span>
    </a>`;
  }).join('')}</div>`;
}

function shortsFeed(ctx, c, films) {
  return `<section class="shorts" data-shorts aria-label="${esc(c.title)}">
  <div class="shorts__track" tabindex="0">
    ${films.filter((f) => f.file).map((f, k) => {
      const i = ctx.data.portfolio.films.indexOf(f);
      return `<article class="short" data-id="${esc(reelId(f))}" data-src="${esc(url(f.file))}">
      <div class="short__frame">
        <video playsinline loop preload="none"${f.image?.src ? ` poster="${esc(url(f.image.src))}"` : ''} aria-label="${esc(f.title)}"></video>
        <span class="short__state" aria-hidden="true"></span>
        <div class="short__info"><span class="short__count">${k + 1} / ${films.length}</span><h2${ed(ctx, `portfolio.films.${i}.title`)}>${esc(f.title)}</h2></div>
        <div class="short__progress"><span></span></div>
      </div>
    </article>`;
    }).join('')}
  </div>
  <div class="shorts__nav">
    <button type="button" data-dir="-1" aria-label="Poprzednia rolka">↑</button>
    <button type="button" data-dir="1" aria-label="Następna rolka">↓</button>
  </div>
  <p class="shorts__hint">Przewiń, aby zobaczyć następną rolkę</p>
</section>`;
}

function filmsPage(ctx) {
  const p = ctx.data.portfolio;
  return `${pageHead(ctx, { kicker: 'Filmy', title: p.filmsTitle || 'Filmy', lead: p.filmsLead, path: 'portfolio' })}
${collectionNav(ctx)}
${collections(ctx.data).map((c, k) => collectionBlock(ctx, c, { limit: c.vertical ? 8 : 6, alt: k % 2 === 1 })).join('')}
${cta(ctx)}`;
}

function collectionNav(ctx, current = '') {
  const list = collections(ctx.data);
  return list.length > 1 ? `<nav class="wrap filters filters--nav" aria-label="Kategorie filmów">
    <a href="${url('filmy/')}"${current ? '' : ' class="is-on"'}>Wszystkie</a>
    ${list.map((c) => `<a href="${url(`filmy/${c.id}/`)}"${current === c.id ? ' class="is-on"' : ''}>${esc(c.title)}</a>`).join('')}
  </nav>` : '';
}

function collectionPage(ctx, c) {
  const photos = c.photoCategory ? ctx.data.portfolio.items.filter((it) => it.category === c.photoCategory) : [];
  if (c.vertical) {
    return `<div class="shorts-head wrap"><h1>${esc(c.title)}</h1>${collectionNav(ctx, c.id)}</div>
${shortsFeed(ctx, c, collectionFilms(ctx.data, c.id))}
${cta(ctx)}`;
  }
  return `${pageHead(ctx, { kicker: 'Filmy', title: c.title, lead: c.lead })}
${collectionNav(ctx, c.id)}
<section class="section section--tight"><div class="wrap">${filmsGrid(ctx, collectionFilms(ctx.data, c.id), { reels: c.vertical })}</div></section>
${photos.length ? `<section class="section section--alt"><div class="wrap"><div class="section__head"><h2>Zdjęcia</h2></div>${portfolioGrid(ctx, photos)}</div></section>` : ''}
${cta(ctx)}`;
}

function postCards(ctx, posts) {
  return `<div class="posts">${posts.map((p) => {
    const i = ctx.data.blog.indexOf(p);
    return `<a class="post-card" href="${url(`blog/${esc(p.slug)}/`)}">
      <div class="post-card__img">${img(ctx, p.image, { path: `blog.${i}.image`, sizes: '(max-width:700px) 100vw, 33vw' })}</div>
      <time datetime="${esc(p.date)}">${formatDate(p.date)}</time>
      <h3${ed(ctx, `blog.${i}.title`)}>${esc(p.title)}</h3>
      <p${ed(ctx, `blog.${i}.excerpt`)}>${esc(p.excerpt)}</p>
      <span class="more">Czytaj dalej →</span>
    </a>`;
  }).join('')}</div>`;
}

function pageHead(ctx, { kicker, title, lead, path }) {
  return `<section class="pagehead">
  <div class="wrap">
    ${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}
    <h1${ed(ctx, path && `${path}.title`)}>${esc(title)}</h1>
    ${lead ? `<p class="lead"${ed(ctx, path && `${path}.lead`)}>${esc(lead)}</p>` : ''}
  </div>
</section>`;
}

const cta = (ctx) => {
  const c = ctx.data.home.contact;
  return `<section class="cta"><div class="wrap cta__in">
    <h2${ed(ctx, 'home.contact.title')}>${esc(c.title)}</h2>
    <a class="btn btn--light" href="${url(`kontakt/`)}">Zapytaj o termin</a>
  </div></section>`;
};

/* ---------- Widżety (włączane w edytorze: „Widżety do dodania”) ---------- */

const WG = (ctx) => ctx.data.widgets || {};
// Widżet jest widoczny, gdy jest włączony (i nieusunięty z listy) – albo gdy edytor pokazuje jego podgląd (ctx.showWidget).
const wgLive = (ctx, key) => !!WG(ctx)[key]?.enabled && !WG(ctx)[key]?.removed;
const wgOn = (ctx, key) => wgLive(ctx, key) || (!!ctx.preview && ctx.showWidget === key);
// Znacznik dla edytora: po nim podgląd odnajduje widżet; data-wg-off = pokazany tylko na próbę.
const wgMark = (ctx, key) => (ctx.preview ? ` data-wg="${key}"${wgLive(ctx, key) ? '' : ' data-wg-off'}` : '');
const wgHead = (ctx, key, w, { center = true } = {}) => (w.title || w.lead) ? `<div class="section__head${center ? ' center' : ''}">
      ${w.title ? `<h2${ed(ctx, `widgets.${key}.title`)}>${esc(w.title)}</h2>` : ''}
      ${w.lead ? `<p class="lead"${ed(ctx, `widgets.${key}.lead`)}>${esc(w.lead)}</p>` : ''}
    </div>` : '';

const WIDGETS = {
  // 1. Karuzela z logotypami (nazwa tekstem, dopóki nie ma logo)
  logos(ctx, w) {
    const items = (w.items || []).filter((x) => x.name || x.image?.src);
    if (!items.length) return '';
    const one = items.map((x, i) => `<li${ed(ctx, `widgets.logos.items.${i}.name`)}>${x.image?.src
      ? `<img src="${esc(url(x.image.src))}" alt="${esc(x.image.alt || x.name || '')}" loading="lazy" decoding="async">`
      : `<span>${esc(x.name)}</span>`}</li>`).join('');
    return `<section class="wg-logos" aria-label="${esc(w.title || 'Klienci')}">
  ${w.title ? `<p class="wg-logos__title"${ed(ctx, 'widgets.logos.title')}>${esc(w.title)}</p>` : ''}
  <div class="wg-logos__viewport"><ul class="wg-logos__track">${one}${one.replace(/<li/g, '<li aria-hidden="true"')}</ul></div>
</section>`;
  },
  // 2. Pozioma galeria przewijana w dół
  hscroll(ctx, w) {
    const items = (w.items || []).filter((x) => x.image?.src);
    if (!items.length) return '';
    return `<section class="wg-hscroll" data-wg-hscroll>
  <div class="wg-hscroll__sticky">
    <div class="wrap">${wgHead(ctx, 'hscroll', w, { center: false })}</div>
    <div class="wg-hscroll__track" data-lightbox>${items.map((x, i) => `<a class="wg-hscroll__item" href="${esc(url(x.image.src))}" data-lb>${img(ctx, x.image, { path: `widgets.hscroll.items.${i}.image`, sizes: '(max-width:700px) 80vw, 40vw' })}</a>`).join('')}</div>
  </div>
</section>`;
  },
  // 3. Rozdziały odsłaniane przy przewijaniu
  chapters(ctx, w) {
    const items = (w.items || []).filter((x) => x.image?.src || x.title);
    if (!items.length) return '';
    return `<section class="section wg-chapters" data-wg-chapters>
  <div class="wrap">${wgHead(ctx, 'chapters', w)}
    <div class="wg-chapters__grid">
      <div class="wg-chapters__media" aria-hidden="true">${items.map((x, i) => `<div class="wg-chapters__img${i ? '' : ' is-on'}">${img(ctx, x.image, { path: `widgets.chapters.items.${i}.image`, sizes: '(max-width:800px) 100vw, 50vw' })}</div>`).join('')}</div>
      <ol class="wg-chapters__list">${items.map((x, i) => `<li class="wg-chapters__step${i ? '' : ' is-on'}">
        <div class="wg-chapters__mimg">${img(ctx, x.image, { sizes: '100vw' })}</div>
        <span class="wg-chapters__n">0${i + 1}</span>
        <h3${ed(ctx, `widgets.chapters.items.${i}.title`)}>${esc(x.title)}</h3>
        <p${ed(ctx, `widgets.chapters.items.${i}.text`)}>${esc(x.text)}</p>
      </li>`).join('')}</ol>
    </div>
  </div>
</section>`;
  },
  // 5. Suwak przed/po
  beforeAfter(ctx, w) {
    const items = (w.items || []).filter((x) => x.before?.src && x.after?.src);
    if (!items.length) return '';
    return `<section class="section section--alt">
  <div class="wrap">${wgHead(ctx, 'beforeAfter', w)}
    <div class="wg-ba-list">${items.map((x, i) => `<figure class="wg-ba">
      <div class="wg-ba__frame" data-wg-ba style="--pos:50%">
        ${img(ctx, x.after, { path: `widgets.beforeAfter.items.${i}.after`, cls: 'wg-ba__after', sizes: '(max-width:800px) 100vw, 50vw' })}
        <div class="wg-ba__before">${img(ctx, x.before, { path: `widgets.beforeAfter.items.${i}.before`, sizes: '(max-width:800px) 100vw, 50vw' })}</div>
        <span class="wg-ba__tag wg-ba__tag--l">Przed</span><span class="wg-ba__tag wg-ba__tag--r">Po</span>
        <span class="wg-ba__handle" aria-hidden="true"></span>
        <input class="wg-ba__range" type="range" min="0" max="100" value="50" aria-label="Porównanie przed i po">
      </div>
      ${x.label ? `<figcaption${ed(ctx, `widgets.beforeAfter.items.${i}.label`)}>${esc(x.label)}</figcaption>` : ''}
    </figure>`).join('')}</div>
  </div>
</section>`;
  },
  // 7. Karuzela opinii
  reviews(ctx, w) {
    const items = (w.items || []).filter((x) => x.text);
    if (!items.length) return '';
    const stars = (n) => { const k = Math.max(0, Math.min(5, Number(n) || 0)); return k ? `<span class="wg-rev__stars" aria-label="Ocena ${k} na 5">${'★'.repeat(k)}${'☆'.repeat(5 - k)}</span>` : ''; };
    return `<section class="section wg-rev" data-wg-reviews>
  <div class="wrap">${wgHead(ctx, 'reviews', w)}
    <div class="wg-rev__track">${items.map((x, i) => `<blockquote class="wg-rev__card">
      ${stars(x.stars)}
      <p${ed(ctx, `widgets.reviews.items.${i}.text`)}>„${esc(x.text)}”</p>
      <footer${ed(ctx, `widgets.reviews.items.${i}.author`)}>${esc(x.author)}</footer>
    </blockquote>`).join('')}</div>
    <div class="wg-rev__nav">
      <button type="button" data-dir="-1" aria-label="Poprzednia opinia">‹</button>
      <button type="button" data-dir="1" aria-label="Następna opinia">›</button>
      ${w.link ? `<a class="more" href="${esc(w.link)}" rel="noopener">Wszystkie opinie w Google →</a>` : ''}
    </div>
  </div>
</section>`;
  },
  // 8. Liczniki
  counters(ctx, w) {
    const d = ctx.data;
    const films = visibleFilms(d);
    const auto = { photos: d.portfolio.items.length, films: films.length, reels: films.filter((f) => f.vertical).length, services: d.services.length };
    const items = (w.items || []).map((x) => ({ ...x, n: x.auto && auto[x.auto] != null ? auto[x.auto] : Number(x.value) || 0 })).filter((x) => x.label);
    if (!items.length) return '';
    return `<section class="wg-count">
  <div class="wrap">
    ${w.title ? `<h2 class="center"${ed(ctx, 'widgets.counters.title')}>${esc(w.title)}</h2>` : ''}
    <ul class="wg-count__list">${items.map((x, i) => `<li><strong data-wg-count="${x.n}">${x.n}${esc(x.suffix || '')}</strong><span${ed(ctx, `widgets.counters.items.${i}.label`)}>${esc(x.label)}</span></li>`).join('')}</ul>
  </div>
</section>`;
  },
  // 9. Kalendarz wolnych terminów (siatka miesięcy rysowana w przeglądarce, żeby zawsze startowała od bieżącego miesiąca)
  calendar(ctx, w) {
    const busy = (w.busy || []).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x));
    return `<section class="section section--alt">
  <div class="wrap">${wgHead(ctx, 'calendar', w)}
    <div class="wg-cal" data-wg-calendar data-busy="${esc(busy.join(','))}" data-months="${Math.max(1, Math.min(12, Number(w.months) || 3))}"></div>
    <p class="wg-cal__legend"><span class="wg-cal__key wg-cal__key--busy"></span> zajęty <span class="wg-cal__key"></span> wolny</p>
    ${w.note ? `<p class="center help-note"${ed(ctx, 'widgets.calendar.note')}>${esc(w.note)}</p>` : ''}
    <p class="center"><a class="btn btn--dark" href="${url(`kontakt/`)}">Zapytaj o termin</a></p>
  </div>
</section>`;
  },
  // 10. Mapa obszaru działania (OpenStreetMap wczytywane dopiero po kliknięciu)
  map(ctx, w) {
    const lat = Number(w.lat) || 49.79, lon = Number(w.lon) || 18.93, z = Math.max(5, Math.min(14, Number(w.zoom) || 10));
    const dx = 360 / 2 ** z * 1.6, dy = dx * 0.55;
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${(lon - dx).toFixed(4)}%2C${(lat - dy).toFixed(4)}%2C${(lon + dx).toFixed(4)}%2C${(lat + dy).toFixed(4)}&layer=mapnik&marker=${lat}%2C${lon}`;
    return `<section class="section">
  <div class="wrap wg-map">
    <div class="wg-map__copy">
      ${w.title ? `<h2${ed(ctx, 'widgets.map.title')}>${esc(w.title)}</h2>` : ''}
      ${w.lead ? `<p class="lead"${ed(ctx, 'widgets.map.lead')}>${esc(w.lead)}</p>` : ''}
      <ul class="wg-map__places">${(w.places || []).filter(Boolean).map((p, i) => `<li${ed(ctx, `widgets.map.places.${i}`)}>${esc(p)}</li>`).join('')}</ul>
    </div>
    <div class="wg-map__box" data-wg-map="${esc(src)}">
      <button type="button" class="wg-map__load"><strong>Pokaż mapę</strong><small>Mapa wczyta się z OpenStreetMap</small></button>
    </div>
  </div>
</section>`;
  },
  // 11. Przesuwający się napis
  marquee(ctx, w) {
    const items = (w.items || []).filter(Boolean);
    if (!items.length) return '';
    const one = items.map((x, i) => `<li${ed(ctx, `widgets.marquee.items.${i}`)}>${esc(x)}</li>`).join('');
    return `<section class="wg-marquee${w.dark ? ' wg-marquee--dark' : ''}" aria-label="${esc(items.join(', '))}">
  <ul class="wg-marquee__track" aria-hidden="true">${one}${one}</ul>
</section>`;
  },
  // 12. Wyróżniona realizacja
  spotlight(ctx, w) {
    if (!w.title && !w.image?.src) return '';
    const href = w.link ? (/^(https?:|mailto:|tel:)/.test(w.link) ? esc(w.link) : url(w.link)) : '';
    return `<section class="section wg-spot">
  <div class="wrap wg-spot__grid">
    <div class="wg-spot__img">${img(ctx, w.image, { path: 'widgets.spotlight.image', sizes: '(max-width:800px) 100vw, 60vw' })}</div>
    <div class="wg-spot__copy">
      ${w.kicker ? `<p class="kicker"${ed(ctx, 'widgets.spotlight.kicker')}>${esc(w.kicker)}</p>` : ''}
      ${w.title ? `<h2${ed(ctx, 'widgets.spotlight.title')}>${esc(w.title)}</h2>` : ''}
      ${w.text ? `<p${ed(ctx, 'widgets.spotlight.text')}>${esc(w.text)}</p>` : ''}
      ${href && w.cta ? `<a class="btn btn--dark" href="${href}"${ed(ctx, 'widgets.spotlight.cta')}>${esc(w.cta)}</a>` : ''}
    </div>
  </div>
</section>`;
  },
  // 13. Cytat na zdjęciu (zdjęcie przesuwa się wolniej niż strona)
  quote(ctx, w) {
    if (!w.text) return '';
    return `<section class="wg-quote" data-wg-parallax>
  <div class="wg-quote__bg">${img(ctx, w.image, { path: 'widgets.quote.image', sizes: '100vw' })}</div>
  <blockquote class="wrap wg-quote__in">
    <p${ed(ctx, 'widgets.quote.text')}>${esc(w.text)}</p>
    ${w.author ? `<footer${ed(ctx, 'widgets.quote.author')}>${esc(w.author)}</footer>` : ''}
  </blockquote>
</section>`;
  },
  // 14. Pakiety i ceny
  pricing(ctx, w) {
    const items = (w.items || []).filter((x) => x.name);
    if (!items.length) return '';
    return `<section class="section section--alt">
  <div class="wrap">${wgHead(ctx, 'pricing', w)}
    <div class="wg-price">${items.map((x, i) => `<article class="wg-price__card${x.featured ? ' is-featured' : ''}">
      ${x.featured && w.badge ? `<span class="wg-price__badge">${esc(w.badge)}</span>` : ''}
      <h3${ed(ctx, `widgets.pricing.items.${i}.name`)}>${esc(x.name)}</h3>
      ${x.price ? `<p class="wg-price__price"${ed(ctx, `widgets.pricing.items.${i}.price`)}>${esc(x.price)}</p>` : ''}
      ${x.text ? `<p class="wg-price__text"${ed(ctx, `widgets.pricing.items.${i}.text`)}>${esc(x.text)}</p>` : ''}
      <ul>${(x.features || []).filter(Boolean).map((f, j) => `<li${ed(ctx, `widgets.pricing.items.${i}.features.${j}`)}>${esc(f)}</li>`).join('')}</ul>
      <a class="btn ${x.featured ? 'btn--light' : 'btn--dark'}" href="${url(`kontakt/`)}">${esc(w.cta || 'Zapytaj o termin')}</a>
    </article>`).join('')}</div>
    ${w.note ? `<p class="center help-note"${ed(ctx, 'widgets.pricing.note')}>${esc(w.note)}</p>` : ''}
  </div>
</section>`;
  },
  // 15. Pytania i odpowiedzi
  faq(ctx, w) {
    const items = (w.items || []).filter((x) => x.q && x.a);
    if (!items.length) return '';
    return `<section class="section">
  <div class="wrap wrap--narrow">${wgHead(ctx, 'faq', w)}
    <div class="wg-faq">${items.map((x, i) => `<details class="wg-faq__item"${ctx.preview && !i ? ' open' : ''}>
      <summary${ed(ctx, `widgets.faq.items.${i}.q`)}>${esc(x.q)}</summary>
      <p${ed(ctx, `widgets.faq.items.${i}.a`)}>${esc(x.a)}</p>
    </details>`).join('')}</div>
  </div>
</section>`;
  },
  // 16. Kafelki z Instagrama (zdjęcia ze strony, link do profilu – bez łączenia się z Instagramem)
  insta(ctx, w) {
    const items = (w.items || []).filter((x) => x.image?.src);
    const link = w.link || ctx.data.site.instagram;
    if (!items.length) return '';
    return `<section class="section wg-insta">
  <div class="wrap">${wgHead(ctx, 'insta', w)}
    <div class="wg-insta__grid">${items.map((x, i) => {
      const pic = img(ctx, x.image, { path: `widgets.insta.items.${i}.image`, sizes: '(max-width:700px) 50vw, 17vw' });
      return link ? `<a href="${esc(link)}" rel="noopener" aria-label="Instagram RAF.studio">${pic}</a>` : `<div>${pic}</div>`;
    }).join('')}</div>
    ${link ? `<p class="center"><a class="btn btn--dark" href="${esc(link)}" rel="noopener"${ed(ctx, 'widgets.insta.cta')}>${esc(w.cta || 'Zobacz na Instagramie')}</a></p>` : ''}
  </div>
</section>`;
  },
  // 21. Stykówka – pasek kliszy z numerami klatek
  contactSheet(ctx, w) {
    const items = (w.items || []).filter((x) => x.image?.src);
    if (!items.length) return '';
    return `<section class="wg-sheet">
  <div class="wrap">${wgHead(ctx, 'contactSheet', w, { center: false })}</div>
  <div class="wg-sheet__strip" data-lightbox tabindex="0" aria-label="Stykówka – przewiń w bok">
    <div class="wg-sheet__film">${items.map((x, i) => `<a class="wg-sheet__frame" href="${esc(url(x.image.src))}" data-lb>
      <span class="wg-sheet__n" aria-hidden="true">${i + 1}${i % 2 ? 'A' : ''}</span>${img(ctx, x.image, { path: `widgets.contactSheet.items.${i}.image`, sizes: '(max-width:700px) 70vw, 30vw' })}</a>`).join('')}</div>
  </div>
</section>`;
  },
  // 22. Ciemnia – odbitki „wywołują się”, gdy wjadą na ekran
  darkroom(ctx, w) {
    const items = (w.items || []).filter((x) => x.image?.src);
    if (!items.length) return '';
    return `<section class="wg-dark" data-wg-develop>
  <div class="wrap">${wgHead(ctx, 'darkroom', w)}
    <div class="wg-dark__row">${items.map((x, i) => `<figure class="wg-dark__print" style="--r:${[-2.5, 1.5, -1, 2.5][i % 4]}deg">
      <a href="${esc(url(x.image.src))}" data-lb>${img(ctx, x.image, { path: `widgets.darkroom.items.${i}.image`, sizes: '(max-width:700px) 90vw, 30vw' })}</a>
      ${x.caption ? `<figcaption${ed(ctx, `widgets.darkroom.items.${i}.caption`)}>${esc(x.caption)}</figcaption>` : ''}
    </figure>`).join('')}</div>
  </div>
</section>`.replace('class="wg-dark__row"', 'class="wg-dark__row" data-lightbox');
  },
  // 23. Latarka – kursor odsłania ciemne zdjęcie
  torch(ctx, w) {
    if (!w.image?.src) return '';
    return `<section class="wg-torch" data-wg-torch>
  <div class="wg-torch__img">${img(ctx, w.image, { path: 'widgets.torch.image', sizes: '100vw' })}</div>
  <div class="wg-torch__shade" aria-hidden="true"></div>
  <div class="wrap wg-torch__in">
    ${w.title ? `<h2${ed(ctx, 'widgets.torch.title')}>${esc(w.title)}</h2>` : ''}
    ${w.lead ? `<p${ed(ctx, 'widgets.torch.lead')}>${esc(w.lead)}</p>` : ''}
  </div>
</section>`;
  },
  // 24. Stos odbitek – kliknięcie odkłada wierzchnie zdjęcie na spód
  stack(ctx, w) {
    const items = (w.items || []).filter((x) => x.image?.src);
    if (!items.length) return '';
    return `<section class="section wg-stack">
  <div class="wrap wg-stack__grid">
    <div class="wg-stack__copy">
      ${w.title ? `<h2${ed(ctx, 'widgets.stack.title')}>${esc(w.title)}</h2>` : ''}
      ${w.lead ? `<p class="lead"${ed(ctx, 'widgets.stack.lead')}>${esc(w.lead)}</p>` : ''}
      <button type="button" class="btn btn--dark" data-wg-stack-next>Następne zdjęcie →</button>
    </div>
    <div class="wg-stack__pile" data-wg-stack>${items.map((x, i) => `<figure class="wg-stack__card" style="--r:${[-4, 3, -2, 5, -3, 2][i % 6]}deg">
      ${img(ctx, x.image, { path: `widgets.stack.items.${i}.image`, sizes: '(max-width:700px) 80vw, 40vw' })}
      <figcaption${ed(ctx, `widgets.stack.items.${i}.caption`)}>${esc(x.caption || '')}</figcaption>
    </figure>`).join('')}</div>
  </div>
</section>`;
  },
  // 25. Mozaika – zdjęcie rozsypane na kafelki składa się przy przewijaniu
  mosaic(ctx, w) {
    if (!w.image?.src) return '';
    return `<section class="wg-mosaic" data-wg-mosaic>
  <div class="wg-mosaic__sticky">
    <div class="wrap">${wgHead(ctx, 'mosaic', w)}
      <div class="wg-mosaic__frame" data-src="${esc(url(w.image.src))}"${ed(ctx, 'widgets.mosaic.image')}>${img(ctx, w.image, { sizes: '(max-width:900px) 100vw, 80vw' })}</div>
    </div>
  </div>
</section>`;
  },
  // 26. Oś czasu filmu – pasek jak w programie montażowym, kliknięcie w scenę przeskakuje do niej
  timeline(ctx, w) {
    const films = (ctx.data.portfolio.films || []).filter((f) => f.file);
    const f = films.find((x) => x.file === w.film) || films[0];
    if (!f) return '';
    const sec = (t) => { const m = String(t ?? '').trim().match(/^(?:(\d+):)?(\d+(?:[.,]\d+)?)$/); return m ? (Number(m[1] || 0) * 60 + Number(m[2].replace(',', '.'))) : 0; };
    const fmt = (n) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
    const scenes = (w.scenes || []).map((x, i) => ({ ...x, i, t: sec(x.time) })).filter((x) => x.label).sort((a, b) => a.t - b.t);
    return `<section class="wg-tl">
  <div class="wrap">${wgHead(ctx, 'timeline', w)}
    <div class="wg-tl__player" data-wg-timeline data-src="${esc(url(f.file))}">
      <div class="wg-tl__screen">
        <video playsinline preload="none"${f.image?.src ? ` poster="${esc(url(f.image.src))}"` : ''} aria-label="${esc(f.title)}"></video>
        <button type="button" class="wg-tl__start" aria-label="Odtwórz film: ${esc(f.title)}"><span class="film__icon" aria-hidden="true"></span></button>
      </div>
      <div class="wg-tl__panel">
        <div class="wg-tl__meta"><strong>${esc(f.title)}</strong><span data-wg-tl-time>0:00</span></div>
        <div class="wg-tl__track">
          ${scenes.map((x, k) => `<button type="button" class="wg-tl__clip" data-t="${x.t}" style="--c:${k % 4}"><small>${fmt(x.t)}</small><span>${esc(x.label)}</span></button>`).join('')}
          <i class="wg-tl__head" aria-hidden="true"></i>
        </div>
      </div>
    </div>
  </div>
</section>`;
  },
  // 27. Ściana rolek – pionowe filmy w ramkach telefonów, grają po kolei bez dźwięku
  reelWall(ctx, w) {
    const n = Math.max(2, Math.min(8, Number(w.count) || 5));
    const films = (ctx.data.portfolio.films || []).filter((f) => f.vertical && f.file).slice(0, n);
    if (!films.length) return '';
    const cols = new Set(collections(ctx.data).map((c) => c.id));
    return `<section class="wg-reels" data-wg-reelwall>
  <div class="wrap">${wgHead(ctx, 'reelWall', w)}</div>
  <div class="wg-reels__row">${films.map((f) => {
    const inner = `<span class="wg-reels__screen">${f.image?.src ? img(ctx, f.image, { sizes: '220px' }) : '<span class="ph"></span>'}<video muted playsinline loop preload="none" aria-hidden="true"></video></span>`;
    return cols.has(f.collection)
      ? `<a class="wg-reels__phone" data-src="${esc(url(f.file))}" href="${url(`filmy/${esc(f.collection)}/`)}#${esc(reelId(f))}" aria-label="Oglądaj rolkę: ${esc(f.title)}">${inner}</a>`
      : `<div class="wg-reels__phone" data-src="${esc(url(f.file))}">${inner}</div>`;
  }).join('')}</div>
</section>`;
  },
  // 28. Pas z filmem w tle
  videoBand(ctx, w) {
    const f = (ctx.data.portfolio.films || []).find((x) => x.file && x.file === w.film);
    const hero = ctx.data.home.hero;
    const src = f ? f.file : hero.video;
    const poster = f ? f.image : hero.image;
    if (!src) return '';
    const href = w.link ? (/^(https?:|mailto:|tel:)/.test(w.link) ? esc(w.link) : url(w.link)) : '';
    return `<section class="wg-vband" data-wg-vband data-src="${esc(url(src))}">
  <div class="wg-vband__media">${img(ctx, poster, { sizes: '100vw' })}<video muted loop playsinline preload="none" aria-hidden="true"></video></div>
  <div class="wrap wg-vband__in">
    ${w.title ? `<h2${ed(ctx, 'widgets.videoBand.title')}>${esc(w.title)}</h2>` : ''}
    ${w.text ? `<p${ed(ctx, 'widgets.videoBand.text')}>${esc(w.text)}</p>` : ''}
    ${href && w.cta ? `<a class="btn btn--light" href="${href}"${ed(ctx, 'widgets.videoBand.cta')}>${esc(w.cta)}</a>` : ''}
  </div>
</section>`;
  },
  // 29. Wysokościomierz – kadr „wznosi się” przy przewijaniu, licznik pokazuje metry
  altimeter(ctx, w) {
    if (!w.image?.src) return '';
    const max = Math.max(10, Math.min(9999, Number(w.max) || 120));
    return `<section class="wg-alt" data-wg-alt data-max="${max}">
  <div class="wg-alt__sticky">
    <div class="wg-alt__img">${img(ctx, w.image, { path: 'widgets.altimeter.image', sizes: '100vw' })}</div>
    <div class="wg-alt__hud" aria-hidden="true">
      <div class="wg-alt__scale"><i></i></div>
      <div class="wg-alt__read"><strong data-wg-alt-n>${max}</strong><span>m</span><small>wysokość lotu</small></div>
    </div>
    <div class="wrap wg-alt__copy">
      ${w.title ? `<h2${ed(ctx, 'widgets.altimeter.title')}>${esc(w.title)}</h2>` : ''}
      ${w.lead ? `<p${ed(ctx, 'widgets.altimeter.lead')}>${esc(w.lead)}</p>` : ''}
    </div>
  </div>
</section>`;
  },
  // 30. Trasa lotu – linia przelotu rysuje się na zdjęciu z góry, z numerami ujęć
  flightPath(ctx, w) {
    if (!w.image?.src) return '';
    const pts = (w.points || []).map((p) => ({ x: Math.max(0, Math.min(100, Number(p.x) || 0)), y: Math.max(0, Math.min(100, Number(p.y) || 0)), label: p.label || '' }));
    // Gładka krzywa przez wszystkie punkty (Catmull-Rom → Bézier).
    let d = '';
    pts.map((p) => ({ x: p.x * 16, y: p.y * 9 })).forEach((p, i, pts) => {
      if (!i) { d = `M${p.x} ${p.y}`; return; }
      const p0 = pts[i - 2] || pts[i - 1], p1 = pts[i - 1], p3 = pts[i + 1] || p;
      const c1x = p1.x + (p.x - p0.x) / 6, c1y = p1.y + (p.y - p0.y) / 6, c2x = p.x - (p3.x - p1.x) / 6, c2y = p.y - (p3.y - p1.y) / 6;
      d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p.x} ${p.y}`;
    });
    return `<section class="section wg-path">
  <div class="wrap">${wgHead(ctx, 'flightPath', w)}
    <div class="wg-path__map" data-wg-path>
      ${img(ctx, w.image, { path: 'widgets.flightPath.image', sizes: '(max-width:900px) 100vw, 1200px' })}
      ${pts.length > 1 ? `<svg viewBox="0 0 1600 900" aria-hidden="true"><path d="${d}" pathLength="1"/></svg>` : ''}
      ${pts.map((p, i) => `<span class="wg-path__pt" style="left:${p.x}%;top:${p.y}%" data-i="${i}"><b>${i + 1}</b></span>`).join('')}
      ${pts.length > 1 ? '<span class="wg-path__drone" aria-hidden="true"></span>' : ''}
    </div>
    ${pts.some((p) => p.label) ? `<ol class="wg-path__legend">${pts.map((p, i) => `<li${ed(ctx, `widgets.flightPath.points.${i}.label`)}>${esc(p.label || `Ujęcie ${i + 1}`)}</li>`).join('')}</ol>` : ''}
  </div>
</section>`;
  },
};

// Widżety w danym miejscu strony głównej, w stałej kolejności.
const WIDGET_ORDER = ['counters', 'logos', 'marquee', 'chapters', 'hscroll', 'beforeAfter', 'spotlight', 'quote', 'reviews', 'pricing', 'faq', 'insta', 'contactSheet', 'darkroom', 'stack', 'torch', 'mosaic', 'timeline', 'reelWall', 'videoBand', 'altimeter', 'flightPath', 'calendar', 'map'];
function widgetsAt(ctx, position) {
  const all = WG(ctx);
  return WIDGET_ORDER.filter((k) => all[k] && wgOn(ctx, k) && (all[k].position || 'beforeContact') === position)
    .map((k) => WIDGETS[k](ctx, all[k]).replace('<section', `<section${wgMark(ctx, k)}`)).join('\n');
}

// Efekty całej strony (klaps, kursor-celownik, migawka) – włączane atrybutem na <body>.
const FX = ['clapper', 'cursor', 'shutter'];
const fxAttrs = (ctx) => {
  const on = FX.filter((k) => wgOn(ctx, k));
  return `${on.length ? ` data-wg-fx="${on.join(' ')}"` : ''}${ctx.preview && ctx.showWidget ? ` data-wg-demo="${esc(ctx.showWidget)}"` : ''}`;
};
// Migawka: zasłona musi istnieć, zanim cokolwiek się narysuje – stąd krótki skrypt od razu po niej.
const shutterHtml = (ctx) => (wgOn(ctx, 'shutter') ? `<div class="wg-shut" data-wg-shutter aria-hidden="true"><i></i><i></i></div>
<script>try{if(sessionStorage.getItem('raf-shut')){sessionStorage.removeItem('raf-shut');document.documentElement.classList.add('wg-shut-open')}}catch(e){}</script>
` : '');

// Widżety widoczne na każdej podstronie (przyklejone do ekranu).
function globalWidgets(ctx) {
  const all = WG(ctx), { site } = ctx.data;
  const out = [];
  if (wgOn(ctx, 'progress')) out.push(`<div class="wg-progress"${wgMark(ctx, 'progress')} data-wg-progress aria-hidden="true"><span></span></div>`);
  const n = all.notice;
  if (n && wgOn(ctx, 'notice') && n.text) {
    const href = n.link ? (/^(https?:|mailto:|tel:)/.test(n.link) ? esc(n.link) : url(n.link)) : '';
    out.push(`<aside class="wg-notice"${wgMark(ctx, 'notice')} data-wg-notice="${esc(String(n.text).length + '-' + String(n.text).slice(0, 24))}" aria-label="Ogłoszenie"${ctx.preview ? '' : ' hidden'}>
  <p${ed(ctx, 'widgets.notice.text')}>${esc(n.text)}</p>
  ${href && n.cta ? `<a class="more" href="${href}"${ed(ctx, 'widgets.notice.cta')}>${esc(n.cta)}</a>` : ''}
  <button type="button" aria-label="Zamknij ogłoszenie">✕</button>
</aside>`);
  }
  const dock = [];
  if (wgOn(ctx, 'toTop')) dock.push(`<button type="button" class="wg-top"${wgMark(ctx, 'toTop')} data-wg-top aria-label="Wróć na górę strony">↑</button>`);
  const f = all.floatCta;
  if (f && wgOn(ctx, 'floatCta')) {
    const digits = String(site.phone || '').replace(/\D/g, '');
    const href = f.target === 'phone' && digits ? `tel:${esc(String(site.phone).replace(/\s/g, ''))}`
      : f.target === 'whatsapp' && digits ? `https://wa.me/${digits.length === 9 ? '48' + digits : digits}`
      : f.target === 'email' && site.email ? `mailto:${esc(site.email)}`
      : url(`kontakt/`);
    // Na samej stronie kontaktu przycisk prowadzący do formularza byłby zbędny.
    if (!(href === url(`kontakt/`) && ctx.path.startsWith('kontakt/'))) {
      dock.push(`<a class="wg-fab"${wgMark(ctx, 'floatCta')} href="${href}"${/^https:/.test(href) ? ' rel="noopener"' : ''}${ed(ctx, 'widgets.floatCta.label')}>${esc(f.label || 'Napisz do mnie')}</a>`);
    }
  }
  if (dock.length) out.push(`<div class="wg-dock">${dock.join('')}</div>`);
  return out.join('\n');
}

/* ---------- Strony ---------- */

function homePage(ctx) {
  const { home: h, portfolio, blog } = ctx.data;
  const posts = blog.filter((p) => p.published).slice(0, 3);
  return `
<section class="hero${wgOn(ctx, 'heroZoom') ? ' wg-zoom' : ''}"${wgOn(ctx, 'heroZoom') ? ' data-wg-zoom' : ''}>
  <div class="hero__media">
    ${h.hero.imageMobile?.src
      ? `<picture class="hero__poster"><source media="(max-width: 899px)" srcset="${esc(url(h.hero.imageMobile.src))}">${img(ctx, h.hero.image, { path: 'home.hero.image', eager: true })}</picture>`
      : img(ctx, h.hero.image, { path: 'home.hero.image', cls: 'hero__poster', eager: true })}
    ${h.hero.video ? `<video class="hero__video" muted loop playsinline preload="none" aria-hidden="true"
      data-src="${esc(url(h.hero.video))}" data-src-mobile="${esc(url(h.hero.videoMobile || h.hero.video))}"
      style="object-position:${h.hero.image?.x ?? 50}% ${h.hero.image?.y ?? 50}%"></video>` : ''}
  </div>
  <div class="wrap hero__content">
    <p class="kicker"${ed(ctx, 'home.hero.kicker')}>${esc(h.hero.kicker)}</p>
    <h1${ed(ctx, 'home.hero.title')}>${esc(h.hero.title)}</h1>
    <p class="lead"${ed(ctx, 'home.hero.lead')}>${esc(h.hero.lead)}</p>
    <div class="hero__actions">
      <a class="btn btn--light" href="${url(`uslugi/`)}"${ed(ctx, 'home.hero.cta')}>${esc(h.hero.cta)}</a>
      <a class="btn btn--ghost" href="${url(`portfolio/`)}">Zobacz portfolio</a>
    </div>
  </div>
  ${h.hero.video ? '<button class="hero__toggle" type="button" data-video-toggle aria-label="Zatrzymaj wideo">❚❚</button>' : ''}
</section>
${widgetsAt(ctx, 'afterHero')}

<section class="split">
  <div class="wrap split__grid">
    <div class="split__img">${img(ctx, h.about.image, { path: 'home.about.image', sizes: '(max-width:800px) 100vw, 45vw' })}</div>
    <div class="split__copy">
      <h2${ed(ctx, 'home.about.title')}>${esc(h.about.title)}</h2>
      ${paras(ctx, h.about.paragraphs, 'home.about.paragraphs')}
      <a class="btn btn--dark" href="${url(`kontakt/`)}"${ed(ctx, 'home.about.cta')}>${esc(h.about.cta)}</a>
    </div>
  </div>
</section>
${widgetsAt(ctx, 'afterAbout')}

<section class="section section--alt" id="oferta">
  <div class="wrap">
    <div class="section__head">
      <h2${ed(ctx, 'home.offer.title')}>${esc(h.offer.title)}</h2>
      <p class="lead"${ed(ctx, 'home.offer.lead')}>${esc(h.offer.lead)}</p>
    </div>
    ${serviceCards(ctx)}
  </div>
</section>
${widgetsAt(ctx, 'afterOffer')}

<section class="dark">
  <div class="wrap split__grid split__grid--rev">
    <div class="split__copy">
      <h2${ed(ctx, 'home.approach.title')}>${esc(h.approach.title)}</h2>
      ${paras(ctx, h.approach.paragraphs, 'home.approach.paragraphs')}
    </div>
    <div class="split__img">${img(ctx, h.approach.image, { path: 'home.approach.image', sizes: '(max-width:800px) 100vw, 45vw' })}</div>
  </div>
  <div class="wrap statement">
    ${h.statement.map((s, i) => `<a href="${esc(url(s.link))}"><strong${ed(ctx, `home.statement.${i}.title`)}>${esc(s.title)}</strong><span${ed(ctx, `home.statement.${i}.text`)}>${esc(s.text)}</span></a>`).join('')}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="center"${ed(ctx, 'home.promise.title')}>${esc(h.promise.title)}</h2>
    <ul class="checks">${h.promise.items.map((t, i) => `<li${ed(ctx, `home.promise.items.${i}`)}>${esc(t)}</li>`).join('')}</ul>
  </div>
</section>

<section class="section section--alt">
  <div class="wrap">
    <div class="section__head">
      <h2${ed(ctx, 'home.portfolio.title')}>${esc(h.portfolio.title)}</h2>
      <p class="lead"${ed(ctx, 'home.portfolio.lead')}>${esc(h.portfolio.lead)}</p>
    </div>
    ${portfolioGrid(ctx, portfolio.items.slice(0, h.portfolio.count || 6))}
    <p class="center"><a class="btn btn--dark" href="${url(`portfolio/`)}">Całe portfolio</a></p>
  </div>
</section>
${widgetsAt(ctx, 'afterPortfolio')}

<section class="section">
  <div class="wrap split__grid">
    ${visibleFilms(ctx.data)[0]
      ? filmCard(ctx, visibleFilms(ctx.data)[0], { large: true })
      : `<div class="split__img split__img--wide">${img(ctx, h.film.image, { path: 'home.film.image', sizes: '(max-width:800px) 100vw, 50vw' })}</div>`}
    <div class="split__copy">
      <h2${ed(ctx, 'home.film.title')}>${esc(h.film.title)}</h2>
      ${paras(ctx, h.film.paragraphs, 'home.film.paragraphs')}
      <a class="more" href="${url(`uslugi/film/`)}">Film w RAF.studio →</a>
    </div>
  </div>
</section>
${widgetsAt(ctx, 'afterFilm')}

<section class="section section--alt">
  <div class="wrap">
    <h2 class="center"${ed(ctx, 'home.process.title')}>${esc(h.process.title)}</h2>
    <ol class="steps">${h.process.steps.map((s, i) => `<li><span class="steps__n">0${i + 1}</span><h3${ed(ctx, `home.process.steps.${i}.title`)}>${esc(s.title)}</h3><p${ed(ctx, `home.process.steps.${i}.text`)}>${esc(s.text)}</p></li>`).join('')}</ol>
  </div>
</section>

${h.reviews.items.length ? `<section class="section">
  <div class="wrap">
    <h2 class="center"${ed(ctx, 'home.reviews.title')}>${esc(h.reviews.title)}</h2>
    <div class="reviews">${h.reviews.items.map((r, i) => `<blockquote><p${ed(ctx, `home.reviews.items.${i}.text`)}>„${esc(r.text)}”</p><footer${ed(ctx, `home.reviews.items.${i}.author`)}>${esc(r.author)}</footer></blockquote>`).join('')}</div>
  </div>
</section>` : ''}

${posts.length ? `<section class="section">
  <div class="wrap">
    <div class="section__head">
      <p class="kicker"${ed(ctx, 'home.journal.label')}>${esc(h.journal.label)}</p>
      <h2${ed(ctx, 'home.journal.title')}>${esc(h.journal.title)}</h2>
    </div>
    ${postCards(ctx, posts)}
  </div>
</section>` : ''}

${widgetsAt(ctx, 'beforeContact')}

${contactBlock(ctx)}`;
}

function servicesPage(ctx) {
  const { home } = ctx.data;
  return `${pageHead(ctx, { kicker: 'Oferta', title: home.offer.title, lead: home.offer.lead, path: 'home.offer' })}
<section class="section section--tight"><div class="wrap">${serviceCards(ctx)}</div></section>
${cta(ctx)}`;
}

function servicePage(ctx, s) {
  const i = ctx.data.services.indexOf(s);
  const p = `services.${i}`;
  const related = ctx.data.portfolio.items.filter((it) => s.portfolioCategory ? it.category === s.portfolioCategory : true).slice(0, 3);
  const films = s.showFilms ? visibleFilms(ctx.data).filter((f) => !s.filmCategory || f.category === s.filmCategory) : [];
  return `
<section class="svc-hero">
  ${img(ctx, s.image, { path: `${p}.image`, cls: 'svc-hero__img', eager: true })}
  <div class="wrap svc-hero__content">
    <p class="kicker"><a href="${url(`uslugi/`)}">Oferta</a></p>
    <h1${ed(ctx, `${p}.title`)}>${esc(s.title)}</h1>
    <p class="lead"${ed(ctx, `${p}.intro`)}>${esc(s.intro)}</p>
  </div>
</section>
<section class="section">
  <div class="wrap svc">
    <div class="svc__text">${paras(ctx, s.paragraphs, `${p}.paragraphs`)}</div>
    <aside class="svc__box">
      <h2>W ramach realizacji</h2>
      <ul class="checks checks--col">${(s.includes || []).map((t, k) => `<li${ed(ctx, `${p}.includes.${k}`)}>${esc(t)}</li>`).join('')}</ul>
      <a class="btn btn--dark" href="${url(`kontakt/`)}">Zapytaj o termin</a>
    </aside>
  </div>
</section>
${films.length ? `<section class="section">
  <div class="wrap">
    <div class="section__head"><h2>Filmy</h2></div>
    ${filmsGrid(ctx, films)}
  </div>
</section>` : ''}
<section class="section section--alt">
  <div class="wrap">
    <div class="section__head"><h2>Z portfolio</h2></div>
    ${portfolioGrid(ctx, related)}
    <p class="center"><a class="btn btn--dark" href="${url(`portfolio/`)}">Całe portfolio</a></p>
  </div>
</section>
${cta(ctx)}`;
}

function portfolioPage(ctx) {
  const { portfolio } = ctx.data;
  return `${pageHead(ctx, { kicker: 'Realizacje', title: portfolio.title, lead: portfolio.lead, path: 'portfolio' })}
<section class="section section--tight"><div class="wrap">${portfolioGrid(ctx, portfolio.items, { filters: true })}</div></section>
${collections(ctx.data).map((c, k) => collectionBlock(ctx, c, { limit: c.vertical ? 4 : 3, alt: k % 2 === 0 })).join('')}
${cta(ctx)}`;
}

function aboutPage(ctx) {
  const h = ctx.data.home;
  return `${pageHead(ctx, { kicker: 'O mnie', title: h.about.title, path: 'home.about' })}
<section class="section section--tight">
  <div class="wrap split__grid">
    <div class="split__img">${img(ctx, h.about.image, { path: 'home.about.image', eager: true })}</div>
    <div class="split__copy">${paras(ctx, h.about.paragraphs, 'home.about.paragraphs')}${paras(ctx, h.approach.paragraphs, 'home.approach.paragraphs')}</div>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <h2 class="center">${esc(h.process.title)}</h2>
    <ol class="steps">${h.process.steps.map((s, i) => `<li><span class="steps__n">0${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
  </div>
</section>
${cta(ctx)}`;
}

function blogPage(ctx) {
  const h = ctx.data.home;
  return `${pageHead(ctx, { kicker: h.journal.label, title: 'Dziennik', lead: h.journal.title })}
<section class="section section--tight"><div class="wrap">${postCards(ctx, ctx.data.blog.filter((p) => p.published))}</div></section>
${cta(ctx)}`;
}

function postPage(ctx, post) {
  const i = ctx.data.blog.indexOf(post);
  return `<article class="article">
  <header class="wrap wrap--narrow article__head">
    <p class="kicker"><a href="${url(`blog/`)}">Dziennik</a> · <time datetime="${esc(post.date)}">${formatDate(post.date)}</time></p>
    <h1${ed(ctx, `blog.${i}.title`)}>${esc(post.title)}</h1>
    <p class="lead"${ed(ctx, `blog.${i}.excerpt`)}>${esc(post.excerpt)}</p>
  </header>
  <div class="wrap article__img">${img(ctx, post.image, { path: `blog.${i}.image`, eager: true })}</div>
  <div class="wrap wrap--narrow article__body">${paras(ctx, post.paragraphs, `blog.${i}.paragraphs`)}</div>
</article>
${cta(ctx)}`;
}

function contactPage(ctx) {
  const c = ctx.data.home.contact;
  return `${pageHead(ctx, { kicker: c.kicker, title: c.title, path: 'home.contact' })}${contactBlock(ctx, { heading: false })}`;
}

function thanksPage() {
  return `<section class="pagehead pagehead--center"><div class="wrap">
    <p class="kicker">Wiadomość wysłana</p><h1>Dziękuję za wiadomość!</h1>
    <p class="lead">Odpowiem najszybciej, jak to możliwe – zwykle w ciągu jednego dnia roboczego.</p>
    <p><a class="btn btn--dark" href="${url(`portfolio/`)}">Zobacz portfolio</a></p>
  </div></section>`;
}

function privacyPage(ctx) {
  const { site } = ctx.data;
  const films = visibleFilms(ctx.data).some((f) => !f.file); // tylko filmy z YouTube/Vimeo
  const stats = !!String(site.goatcounter || '').trim();
  const admin = [site.legalName || site.name, site.address, site.nip && `NIP: ${site.nip}`].filter(Boolean).map(esc).join(', ');
  const mail = site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : 'adres e-mail podany w zakładce Kontakt';
  return `${pageHead(ctx, { kicker: 'Dokument', title: 'Polityka prywatności', lead: 'Jakie dane przetwarzamy, gdy odwiedzasz stronę lub wysyłasz zapytanie, po co i jak długo – oraz jakie masz prawa.' })}
<section class="section section--tight"><div class="wrap wrap--narrow prose">
<p><small>Obowiązuje od 11 listopada 2026 r. Dotyczy strony ${esc(new URL(site.url).host)}.</small></p>

<h2>1. Administrator danych</h2>
<p>Administratorem danych osobowych jest ${admin}. W sprawach dotyczących danych osobowych napisz na ${mail}.</p>

<h2>2. Jakie dane przetwarzamy</h2>
<ul>
<li><strong>Formularz kontaktowy i e-mail:</strong> imię, adres e-mail, opcjonalnie telefon, wybrana usługa, planowany termin i treść wiadomości.</li>
<li><strong>Współpraca:</strong> dane potrzebne do przygotowania oferty, wykonania usługi i rozliczeń, jeśli zapytanie zamieni się w zlecenie.</li>
<li><strong>Dane techniczne:</strong> adres IP, typ przeglądarki i adres odwiedzanej podstrony – zapisywane automatycznie w logach serwera przez dostawcę hostingu.</li>
</ul>

<h2>3. Cele i podstawy prawne</h2>
<ul>
<li>odpowiedź na zapytanie i przygotowanie oferty – art. 6 ust. 1 lit. b RODO (działania przed zawarciem umowy);</li>
<li>pozostała korespondencja – art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes: komunikacja);</li>
<li>wykonanie umowy i obowiązki księgowe – art. 6 ust. 1 lit. b i c RODO;</li>
<li>ustalenie, dochodzenie lub obrona roszczeń – art. 6 ust. 1 lit. f RODO;</li>
<li>bezpieczeństwo strony${stats ? ' i anonimowe statystyki odwiedzin' : ''} – art. 6 ust. 1 lit. f RODO.</li>
</ul>

<h2>4. Formularz kontaktowy</h2>
<p>Wiadomość z formularza jest przekazywana na naszą skrzynkę e-mail za pośrednictwem usługi FormSubmit (formsubmit.co). Dalej przechowujemy ją w skrzynce pocztowej tak jak zwykły e-mail. Podanie danych jest dobrowolne, ale bez adresu e-mail nie możemy odpowiedzieć.</p>

<h2>5. Cookies</h2>
<p>Strona <strong>nie używa plików cookies</strong> ani narzędzi reklamowych i nie śledzi odwiedzających.${stats ? ' Do liczenia odwiedzin używamy usługi GoatCounter, która nie zapisuje cookies ani adresów IP i pokazuje wyłącznie zbiorcze, anonimowe statystyki (np. liczbę wyświetleń podstron).' : ''}${wgLive(ctx, 'map') ? ' Mapa na stronie głównej (OpenStreetMap) wczytuje się dopiero po kliknięciu „Pokaż mapę” – wtedy serwer OpenStreetMap otrzymuje Twój adres IP.' : ''}</p>
${films ? `<h2>6. Filmy z YouTube i Vimeo</h2>
<p>Filmy są osadzone z serwisów YouTube (Google) i Vimeo. Odtwarzacz wczytuje się dopiero po kliknięciu przycisku odtwarzania – dopiero wtedy serwis otrzymuje Twój adres IP i może zapisać własne cookies zgodnie ze swoją polityką prywatności. Miniatury niektórych filmów mogą być pobierane z serwerów YouTube podczas wyświetlania strony.</p>` : ''}
<h2>${films ? 7 : 6}. Odbiorcy danych</h2>
<p>Dane mogą trafić do dostawców usług, z których korzystamy: hostingu strony (GitHub, Inc.), przekazywania wiadomości z formularza (FormSubmit), poczty e-mail${films ? ', serwisów wideo (Google, Vimeo) – po kliknięciu filmu' : ''}${stats ? ', statystyk (GoatCounter)' : ''}, a także do biura rachunkowego, jeśli dojdzie do współpracy. Część z tych firm ma siedzibę poza Europejskim Obszarem Gospodarczym (m.in. w USA); przekazanie odbywa się na podstawie decyzji Komisji Europejskiej (EU-US Data Privacy Framework) lub standardowych klauzul umownych.</p>

<h2>${films ? 8 : 7}. Jak długo przechowujemy dane</h2>
<ul>
<li>zapytania, które nie zakończyły się współpracą – do 12 miesięcy od ostatniego kontaktu;</li>
<li>dane związane z umową – przez okres przedawnienia roszczeń i wymagany przepisami podatkowymi (zwykle 5 lat od końca roku podatkowego);</li>
<li>logi serwera – zgodnie z zasadami dostawcy hostingu.</li>
</ul>

<h2>${films ? 9 : 8}. Twoje prawa</h2>
<p>Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia oraz wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie. Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, uodo.gov.pl).</p>

<h2>${films ? 10 : 9}. Strefa klienta</h2>
<p>Prywatne galerie dla klientów${site.gallery ? ` (<a href="${esc(site.gallery)}">${esc(new URL(site.gallery).host)}</a>)` : ''} działają jako osobna usługa – informacje o przetwarzaniu danych w galerii klient otrzymuje razem z dostępem do niej.</p>

<h2>${films ? 11 : 10}. Zmiany</h2>
<p>Gdy zmienimy sposób przetwarzania danych (np. dodamy nowe narzędzie), zaktualizujemy ten dokument i datę jego obowiązywania.</p>
</div></section>`;
}

function notFoundPage() {
  return `<section class="pagehead pagehead--center"><div class="wrap">
    <p class="kicker">404</p><h1>Tej strony tu nie ma.</h1>
    <p class="lead">Mogła zmienić adres. Zacznij od strony głównej.</p>
    <p><a class="btn btn--dark" href="${url(``)}">Strona główna</a></p>
  </div></section>`;
}

/* ---------- Dane strukturalne (Google) ---------- */

function businessJsonLd(data) {
  const { site, services } = data;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': site.url + '/#firma',
    name: site.name,
    url: site.url + '/',
    image: site.url + abs(site.shareImage),
    logo: site.url + abs(site.logoDark),
    description: site.seoDescription,
    email: site.email || undefined,
    telephone: site.phone || undefined,
    address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: 'PL' },
    areaServed: site.areaServed,
    sameAs: [site.instagram, site.facebook, site.youtube].filter(Boolean),
    hasOfferCatalog: {
      '@type': 'OfferCatalog', name: 'Oferta',
      itemListElement: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, url: `${site.url}/uslugi/${s.slug}/` } })),
    },
  };
}

/* ---------- Statystyki odwiedzin (GoatCounter – bez cookies) ---------- */
function statsScript(ctx) {
  const code = String(ctx.data.site.goatcounter || '').trim().toLowerCase();
  if (!code || ctx.preview || ctx.noindex || !/^[a-z0-9-]+$/.test(code)) return '';
  return `<script data-goatcounter="https://${code}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>\n`;
}

/* ---------- Szkielet dokumentu ---------- */

function layout(ctx, { title, description, body, image, overlay = false, jsonld = [], hidden = false }) {
  if (hidden) ctx = { ...ctx, noindex: true };
  const { site } = ctx.data;
  const canonical = site.url + '/' + ctx.path;
  const share = site.url + abs(image?.src || site.shareImage);
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${ctx.noindex ? '<meta name="robots" content="noindex,nofollow">\n' : ''}<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(share)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b0b0c">
<link rel="icon" href="${url(`favicon.ico`)}" sizes="48x48">
<link rel="icon" href="${url(`icon-192.png`)}" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="${url(`apple-touch-icon.png`)}">
<link rel="manifest" href="${url(`site.webmanifest`)}">
<link rel="preload" href="${url(`fonts/inter-latin.woff2`)}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset(`style.css`)}">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body${overlay ? ' class="has-overlay"' : ''}${fxAttrs(ctx)}>
${shutterHtml(ctx)}<a class="skip" href="#tresc">Przejdź do treści</a>
${header(ctx, { overlay })}
<main id="tresc">${body}</main>
${footer(ctx)}
${globalWidgets(ctx)}
<script src="${asset(`site.js`)}" defer></script>
${statsScript(ctx)}</body>
</html>`;
}

/* ---------- Lista wszystkich podstron ---------- */

export function routes(data, { preview = false, base = '', noindex = false, v = '', showWidget = '' } = {}) {
  const { site, home, services, portfolio, blog } = data;
  const mk = (path, fn) => ({ path, render: () => { BASE = base; ASSET_V = v; return fn({ data, path, preview, noindex, showWidget }); } });
  const t = (s) => `${s} | ${site.name}`;
  const crumbs = (items) => ({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${site.url}/${p}` })),
  });

  const list = [
    mk('', (ctx) => layout(ctx, { title: site.seoTitle, description: site.seoDescription, overlay: true, body: homePage(ctx), image: home.hero.image, jsonld: [businessJsonLd(data)] })),
    mk('uslugi/', (ctx) => layout(ctx, { title: t('Oferta – fotografia, film i dron w Bielsku-Białej'), description: home.offer.lead + ' ' + services.map((s) => s.title).join(', ') + '.', body: servicesPage(ctx) })),
    ...services.map((s) => mk(`uslugi/${s.slug}/`, (ctx) => layout(ctx, { title: s.seoTitle || t(s.title), description: s.seoDescription || s.short, overlay: true, image: s.image, body: servicePage(ctx, s), jsonld: [crumbs([['Oferta', 'uslugi/'], [s.title, `uslugi/${s.slug}/`]])] }))),
    mk('portfolio/', (ctx) => layout(ctx, { title: t('Portfolio – fotografia i film'), description: portfolio.lead, body: portfolioPage(ctx) })),
    ...(collections(data).length ? [mk('filmy/', (ctx) => layout(ctx, { title: t(portfolio.filmsTitle || 'Filmy'), description: portfolio.filmsLead || portfolio.lead, body: filmsPage(ctx) }))] : []),
    ...collections(data).map((c) => mk(`filmy/${c.id}/`, (ctx) => layout(ctx, { title: c.seoTitle || t(c.title), description: c.seoDescription || c.lead || '', body: collectionPage(ctx, c), image: collectionFilms(data, c.id)[0]?.image }))),
    mk('o-mnie/', (ctx) => layout(ctx, { title: t('O mnie'), description: home.about.paragraphs[0], image: home.about.image, body: aboutPage(ctx) })),
    mk('blog/', (ctx) => layout(ctx, { title: t('Dziennik'), description: home.journal.title, body: blogPage(ctx) })),
    ...blog.filter((p) => p.published || preview).map((p) => mk(`blog/${p.slug}/`, (ctx) => layout(ctx, {
      title: t(p.title), description: p.excerpt, image: p.image, body: postPage(ctx, p),
      jsonld: [{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, datePublished: p.date, image: site.url + abs(p.image?.src), author: { '@type': 'Person', name: 'Rafał – RAF.studio' }, publisher: { '@id': site.url + '/#firma' } }],
    }))),
    mk('kontakt/', (ctx) => layout(ctx, { title: t('Kontakt – zapytaj o termin'), description: home.contact.text, body: contactPage(ctx) })),
    mk('kontakt/dziekujemy/', (ctx) => layout(ctx, { title: t('Dziękujemy za wiadomość'), description: '', hidden: true, body: thanksPage(ctx) })),
    mk('polityka-prywatnosci/', (ctx) => layout(ctx, { title: t('Polityka prywatności'), description: 'Jak RAF.studio przetwarza dane osobowe osób odwiedzających stronę i wysyłających zapytania.', body: privacyPage(ctx) })),
  ];
  return list;
}

export function notFound(data, { base = '', v = '' } = {}) {
  BASE = base; ASSET_V = v;
  const ctx = { data, path: '404.html', preview: false };
  return layout(ctx, { title: `Nie znaleziono | ${data.site.name}`, description: '', body: notFoundPage() }).replace('<head>', '<head>\n<meta name="robots" content="noindex">');
}

// Wszystkie pliki generowane z treści: { "ścieżka/pliku": "zawartość" }.
// Używane przez build.mjs (Node) i przez przycisk „Opublikuj” w edytorze (przeglądarka).
export function renderSite(data, { base = '', noindex = false, v = '' } = {}) {
  const files = {};
  const pages = routes(data, { base, noindex, v });
  for (const r of pages) files[r.path + 'index.html'] = r.render();
  files['404.html'] = notFound(data, { base, v });
  const siteUrl = data.site.url.replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);

  // Stare adresy (poprzednia wersja strony) → nowe podstrony.
  const REDIRECTS = {
    'fotografia/index.html': 'uslugi/', 'fotografia.html': 'uslugi/', 'film/index.html': 'uslugi/film/', 'film.html': 'uslugi/film/',
    'realizacja.html': 'portfolio/', 'privacy.html': 'polityka-prywatnosci/', 'polityka-prywatnosci.html': 'polityka-prywatnosci/',
    'edytorstrony.html': 'admin/', 'admin.html': 'admin/', 'mobile-editor.html': 'admin/',
  };
  for (const [from, to] of Object.entries(REDIRECTS)) {
    const target = `${base}/${to}`;
    files[from] = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Przekierowanie</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${siteUrl}/${to}">
<meta http-equiv="refresh" content="0; url=${target}"><script>location.replace(${JSON.stringify(target)}+location.hash)</script></head>
<body><a href="${target}">Przejdź do nowej strony</a></body></html>
`;
  }

  const listed = pages.filter((r) => !r.path.startsWith('kontakt/dziekujemy'));
  files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listed.map((r) => `  <url><loc>${siteUrl}/${r.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
  files['robots.txt'] = noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
  return files;
}

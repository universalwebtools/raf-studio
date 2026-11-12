// Szablony strony RAF.studio.
// Ten sam plik działa w Node (build.mjs) i w przeglądarce (podgląd w edytorze),
// więc nie może importować niczego z Node.

import { legacyHome } from './legacy-home.mjs';

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


/* ---------- Wspólne elementy (system: assets kit „tasteskill”, kolory three-stones, Host Grotesk) ---------- */

const ARROW = '<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';
const MAIN_ACTION = 'Zapytaj o termin';
// Główna akcja prowadzi do formularza na stronie głównej (#kontakt), z każdej podstrony.
const mainHref = () => url(`#kontakt`);

function header(ctx) {
  const { site, services } = ctx.data;
  const cur = ctx.path;
  const films = (ctx.data.portfolio.films || []).length;
  const word = (href, label) => `<div class="nav__item"><a class="nav__link" href="${url(href)}"${cur && cur.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a></div>`;
  const half = Math.ceil(services.length / 2);
  const col = (list) => list.map((s) => `<a href="${url(`uslugi/${esc(s.slug)}/`)}">${esc(s.title)}<span>${esc(s.navLine || s.short.split(/[.,–]/)[0]).slice(0, 30)}</span></a>`).join('');
  const card = services.find((s) => s.image?.src);
  return `<header class="nav">
  <div class="wrap nav__bar">
    <a class="skip-link" href="#top">Przejdź do treści</a>
    <a class="nav__logo" href="${url(``)}" aria-label="${esc(site.name)}, strona główna"><img class="rf-logo" src="${esc(url(site.logoDark))}" alt="${esc(site.name)}" width="104" height="34"></a>
    <nav class="nav__links" aria-label="Menu główne">
      <div class="nav__item">
        <a class="nav__link" href="${url(`uslugi/`)}"${cur.startsWith('uslugi/') ? ' aria-current="page"' : ''}>Oferta <svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        <div class="nav__menu">
          <div class="wrap grid">
            <div class="menu-col span-3"><p class="t-label">Ludzie</p>${col(services.slice(0, half))}</div>
            <div class="menu-col span-3"><p class="t-label">Firmy i miejsca</p>${col(services.slice(half))}</div>
            ${card ? `<a class="menu-card span-3 start-10" href="${url(`uslugi/${esc(card.slug)}/`)}">
              <div class="panel">${img(ctx, card.image, { cls: 'frame__img', sizes: '300px' })}</div>
              <span class="t-card">${esc(card.title)}</span>
              <span class="t-small muted">${esc(site.city)} i okolice</span>
            </a>` : ''}
          </div>
        </div>
      </div>
      ${word('portfolio/', 'Portfolio')}
      ${films ? word('filmy/', 'Filmy') : ''}
      ${word('o-mnie/', 'O mnie')}
      ${word('blog/', 'Dziennik')}
    </nav>
    <div class="nav__actions">
      ${site.gallery ? `<a class="nav__link" href="${esc(site.gallery)}" rel="noopener">Strefa klienta</a>` : ''}
      <a class="btn btn--primary" href="${mainHref()}">${MAIN_ACTION}</a>
    </div>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
  </div>
</header>`;
}

// Ostatni ekran każdej strony: zaproszenie (close-type) i stopka z linkami (footer-columns).
function footer(ctx) {
  const { site, services, home } = ctx.data;
  const c = home.close || {};
  const cols = (ctx.data.portfolio.filmCollections || []).filter((k) => (ctx.data.portfolio.films || []).some((f) => f.collection === k.id));
  const social = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['youtube', 'YouTube']].filter(([k]) => site[k]);
  const li = (href, label, ext) => `<li><a href="${ext ? esc(href) : url(href)}"${ext ? ' rel="noopener"' : ''}>${esc(label)}</a></li>`;
  return `<footer class="footer closing" id="contact" aria-labelledby="close-h">
  <div class="wrap">
    <div class="closing__cta close--type">
      <div class="section-head">
        <h2 id="close-h"${ed(ctx, 'home.close.title')}>${esc(c.title || MAIN_ACTION)}</h2>
        ${c.line ? `<p${ed(ctx, 'home.close.line')}>${esc(c.line)}</p>` : ''}
      </div>
      <a class="btn btn--primary btn--xl btn--wide" href="${mainHref()}">${MAIN_ACTION}${ARROW}</a>
    </div>
    <div class="closing__links">
      <div class="grid">
        <div class="span-4 stack-4">
          <a class="nav__logo" href="${url(``)}"><img class="rf-logo" src="${esc(url(site.logoDark))}" alt="${esc(site.name)}" width="104" height="34" loading="lazy"></a>
          <p class="footer__lede"${ed(ctx, 'site.tagline')}>${esc(site.tagline)}, ${esc(site.city)}</p>
        </div>
        <div class="span-2 footer__col"><h3>Oferta</h3><ul>${services.map((s) => li(`uslugi/${s.slug}/`, s.title)).join('')}</ul></div>
        <div class="span-2 footer__col"><h3>Filmy</h3><ul>${cols.map((k) => li(`filmy/${k.id}/`, k.title)).join('')}</ul></div>
        <div class="span-2 footer__col"><h3>Strona</h3><ul>${li('portfolio/', 'Portfolio')}${li('o-mnie/', 'O mnie')}${li('blog/', 'Dziennik')}${li('kontakt/', 'Kontakt')}</ul></div>
        <div class="span-2 footer__col"><h3>Kontakt</h3><ul>
          ${site.email ? `<li><a href="mailto:${esc(site.email)}">E-mail</a></li>` : ''}
          ${site.phone ? `<li><a href="tel:${esc(site.phone.replace(/\s/g, ''))}">${esc(site.phone)}</a></li>` : ''}
          ${social.map(([k, l]) => li(site[k], l, true)).join('')}
          ${site.gallery ? li(site.gallery, 'Strefa klienta', true) : ''}
        </ul></div>
      </div>
      <div class="footer__legal">
        <span>&copy; ${new Date().getFullYear()} ${esc(site.name)} &nbsp; <a href="${url(`polityka-prywatnosci/`)}">Polityka prywatności</a></span>
        <div class="socials"></div>
      </div>
    </div>
  </div>
</footer>`;
}

// Formularz zapytania (recepta „booking-form”): system.js wysyła go do FormSubmit (data-endpoint),
// pokazuje błędy pod polami i potwierdzenie dopiero po prawdziwej wysyłce.
function contactForm(ctx) {
  const { site, services } = ctx.data;
  const to = site.formEmail || site.email;
  if (!to) return '';
  const thanks = site.url.replace(/\/$/, '') + '/kontakt/dziekujemy/';
  const f = (id, label, input, err, full) => `<div class="field${full ? ' field--full' : ''}"><label for="f-${id}">${label}</label>${input}<p class="field__error" id="f-${id}-err" hidden>${err}</p></div>`;
  return `<form class="form rf-form" method="POST" action="https://formsubmit.co/${esc(to)}" data-endpoint="https://formsubmit.co/ajax/${esc(to)}" data-sent="Zapytanie o termin wysłane. Odpowiem mailem na podany adres." novalidate>
      <input type="hidden" name="_subject" value="Zapytanie o termin – ${esc(site.name)}">
      <input type="hidden" name="_template" value="table">
      <input type="hidden" name="_captcha" value="false">
      <input type="hidden" name="_next" value="${esc(thanks)}">
      <div class="rf-hp" aria-hidden="true"><label>Nie wypełniaj<input name="_honey" tabindex="-1" autocomplete="off"></label></div>
      ${f('name', 'Imię', '<input id="f-name" name="Imię" type="text" autocomplete="name" required maxlength="100" aria-describedby="f-name-err">', 'Wpisz swoje imię.')}
      ${f('email', 'E-mail', '<input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="150" aria-describedby="f-email-err">', 'Wpisz adres e-mail z @, np. jan@poczta.pl.')}
      ${f('service', 'Usługa', `<select id="f-service" name="Usługa" aria-describedby="f-service-err">${services.map((s) => `<option>${esc(s.title)}</option>`).join('')}<option>Coś innego</option></select>`, 'Wybierz usługę.')}
      ${f('date', 'Termin', '<input id="f-date" name="Termin" type="text" autocomplete="off" maxlength="60" aria-describedby="f-date-err">', 'Wpisz dzień albo miesiąc.')}
      ${f('msg', 'Miejsce i pomysł', '<textarea id="f-msg" name="Wiadomość" rows="4" required maxlength="5000" aria-describedby="f-msg-err"></textarea>', 'Napisz kilka słów: gdzie i co mam sfotografować lub nagrać.', true)}
      <div class="field field--full rf-consent"><label><input type="checkbox" name="Zgoda" value="tak" required aria-describedby="f-ok-err"><span>Zgadzam się na użycie moich danych do odpowiedzi na to zapytanie (<a href="${url(`polityka-prywatnosci/`)}">polityka prywatności</a>).</span></label><p class="field__error" id="f-ok-err" hidden>Zaznacz zgodę, żebym mógł odpowiedzieć.</p></div>
      <div class="btn-row"><button class="btn btn--primary" type="submit">${MAIN_ACTION}</button></div>
      <p class="form__status" role="status" data-form-status></p>
    </form>`;
}

// Sekcja z formularzem (strona główna i /kontakt/).
function bookingSection(ctx, { tag = 'section', page = false } = {}) {
  const { site, home } = ctx.data;
  const c = home.contact;
  const Hd = page ? 'h1' : 'h2';
  return `<${tag} class="${page ? 'rf-sec rf-sec--first' : 'section'}" id="kontakt" aria-labelledby="kontakt-h">
  <div class="wrap grid grid--top">
    <div class="span-6">
      <div class="section-head">
        <${Hd} id="kontakt-h"${ed(ctx, 'home.contact.title')}>${esc(c.title)}</${Hd}>
        <p${ed(ctx, 'home.contact.text')}>${esc(c.text)}${site.email ? ` Albo napisz na <a class="rf-mail" href="mailto:${esc(site.email)}">${esc(site.email)}</a>.` : ''}</p>
      </div>
      ${contactForm(ctx)}
    </div>
    ${c.image?.src ? `<div class="frame frame--photo frame--fill span-6 start-7 rf-contact__img">${img(ctx, c.image, { path: 'home.contact.image', cls: 'frame__img', sizes: '(max-width:700px) 100vw, 50vw' })}</div>` : ''}
  </div>
</${tag}>`;
}

// Wiersze usług (recepta „services-list”).
function serviceRows(ctx) {
  return `<ul class="rows rf-rows">${ctx.data.services.map((s, i) => `<li>
      <a class="rows__name rf-rows__link" href="${url(`uslugi/${esc(s.slug)}/`)}"${ed(ctx, `services.${i}.title`)}>${esc(s.title)}</a>
      <span class="rows__value"${ed(ctx, `services.${i}.navLine`)}>${esc(s.navLine || '')}</span>
    </li>`).join('')}</ul>`;
}

// Galeria zdjęć z filtrami i powiększaniem (portfolio, usługi).
function portfolioGrid(ctx, items, { filters = false } = {}) {
  const { portfolio } = ctx.data;
  const cats = portfolio.categories.filter((c) => items.some((it) => it.category === c));
  return `${filters && cats.length > 1 ? `<div class="rf-chips" role="group" aria-label="Kategorie zdjęć">
      <button type="button" class="is-on" data-filter="*">Wszystkie</button>
      ${cats.map((c) => `<button type="button" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>` : ''}
    <div class="rf-gallery" data-lightbox>${items.map((it) => {
      const idx = portfolio.items.indexOf(it);
      return `<a class="rf-gallery__item" data-cat="${esc(it.category)}" href="${esc(url(it.image?.src))}" data-lb aria-label="Powiększ: ${esc(it.title)}">${img(ctx, it.image, { path: `portfolio.items.${idx}.image`, sizes: '(max-width:700px) 50vw, 33vw' })}</a>`;
    }).join('')}</div>`;
}

// Nagłówek podstrony.
function pageHead(ctx, { kicker, title, lead, path }) {
  return `<section class="rf-sec rf-sec--first rf-head">
  <div class="wrap">
    ${kicker ? `<p class="t-label muted">${esc(kicker)}</p>` : ''}
    <h1${ed(ctx, path && `${path}.title`)}>${esc(title)}</h1>
    ${lead ? `<p class="t-lead measure"${ed(ctx, path && `${path}.lead`)}>${esc(lead)}</p>` : ''}
  </div>
</section>`;
}

function collectionBlock(ctx, c, { limit = 0, alt = false } = {}) {
  const all = collectionFilms(ctx.data, c.id);
  const films = limit ? all.slice(0, limit) : all;
  const i = ctx.data.portfolio.filmCollections.indexOf(c);
  return `<section class="rf-sec${alt ? ' ground-surface' : ''}" id="${esc(c.id)}">
  <div class="wrap">
    <div class="section-head section-head--row">
      <div><h2${ed(ctx, `portfolio.filmCollections.${i}.title`)}>${esc(c.title)}</h2>${c.lead ? `<p${ed(ctx, `portfolio.filmCollections.${i}.lead`)}>${esc(c.lead)}</p>` : ''}</div>
      ${limit && all.length > films.length ? `<a class="btn btn--secondary" href="${url(`filmy/${c.id}/`)}">Zobacz wszystkie (${all.length})</a>` : ''}
    </div>
    ${c.vertical ? reelLinks(ctx, c, films) : filmsGrid(ctx, films)}
  </div>
</section>`;
}

const cta = () => '';

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
  // Tytuł nad kadrem, w karcie (bez podpisu pod obrazem).
  return `<article class="card card--open film${large ? ' film--large' : ''}${f.vertical ? ' film--vertical' : ''}">
    <h3 class="film__title"${ed(ctx, `portfolio.films.${i}.title`)}>${esc(f.title)}</h3>
    <button type="button" class="film__play" ${play} aria-label="Odtwórz film: ${esc(f.title)}">
      ${poster}<span class="film__icon" aria-hidden="true"></span>
    </button>
  </article>`;
}

const filmsGrid = (ctx, films, { reels = false } = {}) => `<div class="films${reels ? ' films--reels' : ''}">${films.map((f) => filmCard(ctx, f)).join('')}</div>
  ${films.some((f) => !f.file) ? '<p class="films__note">Filmy z YouTube i Vimeo wczytują się dopiero po kliknięciu.</p>' : ''}`;

const visibleFilms = (data) => (data.portfolio.films || []).filter((f) => filmSource(f));

/* ---------- Kolekcje filmów (rolki, gmina, straż, reklama) ---------- */
const collections = (data) => (data.portfolio.filmCollections || []).filter((c) => visibleFilms(data).some((f) => f.collection === c.id));
const collectionFilms = (data, id) => visibleFilms(data).filter((f) => f.collection === id);

/* ---------- Rolki w stylu „Shorts”: jeden film na ekran, przewijanie = następny ---------- */
const reelId = (f) => String(f.file || f.url || f.title).split('/').pop().replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-');

// Miniatury rolek prowadzące do odtwarzacza na właściwym filmie.
function reelLinks(ctx, c, films) {
  return `<div class="films films--reels">${films.map((f) => {
    const i = ctx.data.portfolio.films.indexOf(f);
    return `<a class="film film--vertical film--link" href="${url(`filmy/${c.id}/`)}#${esc(reelId(f))}" aria-label="Oglądaj rolkę: ${esc(f.title)}">
      <span class="film__cap"${ed(ctx, `portfolio.films.${i}.title`)}>${esc(f.title)}</span>
      <span class="film__play">${f.image?.src ? img(ctx, f.image, { path: `portfolio.films.${i}.image`, sizes: '(max-width:700px) 50vw, 240px' }) : '<span class="ph"></span>'}<span class="film__icon" aria-hidden="true"></span></span>
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
${collections(ctx.data).map((c, k) => collectionBlock(ctx, c, { limit: c.vertical ? 8 : 6, alt: k % 2 === 1 })).join('')}`;
}

function collectionNav(ctx, current = '') {
  const list = collections(ctx.data);
  return list.length > 1 ? `<nav class="wrap rf-chips rf-chips--nav" aria-label="Kategorie filmów">
    <a href="${url('filmy/')}"${current ? '' : ' class="is-on" aria-current="page"'}>Wszystkie</a>
    ${list.map((c) => `<a href="${url(`filmy/${c.id}/`)}"${current === c.id ? ' class="is-on" aria-current="page"' : ''}>${esc(c.title)}</a>`).join('')}
  </nav>` : '';
}

function collectionPage(ctx, c) {
  const photos = c.photoCategory ? ctx.data.portfolio.items.filter((it) => it.category === c.photoCategory) : [];
  if (c.vertical) {
    return `<div class="shorts-head wrap"><h1>${esc(c.title)}</h1>${collectionNav(ctx, c.id)}</div>
${shortsFeed(ctx, c, collectionFilms(ctx.data, c.id))}`;
  }
  return `${pageHead(ctx, { kicker: 'Filmy', title: c.title, lead: c.lead })}
${collectionNav(ctx, c.id)}
<section class="rf-sec rf-sec--tight"><div class="wrap">${filmsGrid(ctx, collectionFilms(ctx.data, c.id))}</div></section>
${photos.length ? `<section class="rf-sec ground-surface"><div class="wrap"><div class="section-head"><h2>Zdjęcia jednostek</h2></div>${portfolioGrid(ctx, photos)}</div></section>` : ''}`;
}

function postCards(ctx, posts) {
  return `<div class="grid rf-posts">${posts.map((p) => {
    const i = ctx.data.blog.indexOf(p);
    return `<a class="card card--open span-4 rf-post" href="${url(`blog/${esc(p.slug)}/`)}">
      <div class="panel panel--top rf-post__img">${img(ctx, p.image, { path: `blog.${i}.image`, cls: 'frame__img', sizes: '(max-width:700px) 100vw, 33vw' })}</div>
      <p class="t-small muted"><time datetime="${esc(p.date)}">${formatDate(p.date)}</time></p>
      <h3${ed(ctx, `blog.${i}.title`)}>${esc(p.title)}</h3>
      <p${ed(ctx, `blog.${i}.excerpt`)}>${esc(p.excerpt)}</p>
    </a>`;
  }).join('')}</div>`;
}

/* ---------- Strona główna: plan ekranów ----------
   hero split (film w kadrze) · oferta (services-list) · realizacje (photo-chapters) ·
   filmy (ground-surface) · współpraca w 3 krokach (steps, ground-surface) ·
   o mnie (word-highlight) · formularz (booking-form) · footer.closing (close-type + footer-columns) */
function homePage(ctx) {
  const { home: h, portfolio } = ctx.data;
  const hero = h.hero;
  const pick = (ids) => (ids || []).map((id) => visibleFilms(ctx.data).find((f) => reelId(f) === id)).filter(Boolean);
  const films = pick(h.filmsBlock?.films);
  const offerImg = h.offer.image || ctx.data.services[0]?.image;
  return `
<section class="hero hero--split" data-enter aria-labelledby="hero-h">
  <div class="wrap"><div class="hero-text grid hero__grid">
    <div class="hero__text span-5">
      ${hero.kicker ? `<p class="hero__kicker"${ed(ctx, 'home.hero.kicker')}><span class="dot" aria-hidden="true"></span>${esc(hero.kicker)}</p>` : ''}
      <h1 id="hero-h"${ed(ctx, 'home.hero.title')}>${esc(hero.title)}</h1>
      <p class="hero__lead"${ed(ctx, 'home.hero.lead')}>${esc(hero.lead)}</p>
      <div class="btn-row">
        <a class="btn btn--primary" href="${mainHref()}">${MAIN_ACTION}${ARROW}</a>
        ${hero.cta2 ? `<a class="btn btn--secondary" href="${url('filmy/')}"${ed(ctx, 'home.hero.cta2')}>${esc(hero.cta2)}</a>` : ''}
      </div>
    </div>
    <div class="hero__media span-6 start-7">
      ${hero.video ? `<video class="hero__video" muted loop playsinline preload="none" aria-label="${esc(hero.image?.alt || 'Montaż ujęć z filmów RAF.studio')}"
        poster="${esc(url(hero.image?.src))}" data-src="${esc(url(hero.video))}" data-src-mobile="${esc(url(hero.videoMobile || hero.video))}"></video>`
        : img(ctx, hero.image, { path: 'home.hero.image', eager: true })}
      ${hero.video ? '<button class="rf-pause" type="button" data-video-toggle aria-label="Zatrzymaj film">❚❚</button>' : ''}
      ${hero.float?.title ? `<div class="ly-float">
        <div class="ly-float__row"><span class="ly-live"${ed(ctx, 'home.hero.float.label')}>${esc(hero.float.label)}</span></div>
        <div class="ly-float__title"${ed(ctx, 'home.hero.float.title')}>${esc(hero.float.title)}</div>
      </div>` : ''}
    </div>
  </div></div>
</section>

<section class="section" id="oferta" aria-labelledby="oferta-h">
  <div class="wrap grid grid--top">
    <div class="span-5">
      <div class="section-head">
        <h2 id="oferta-h"${ed(ctx, 'home.offer.title')}>${esc(h.offer.title)}</h2>
        <p${ed(ctx, 'home.offer.lead')}>${esc(h.offer.lead)}</p>
      </div>
      ${serviceRows(ctx)}
    </div>
    <div class="frame frame--photo frame--portrait span-6 start-7">${img(ctx, offerImg, { path: 'home.offer.image', cls: 'frame__img', sizes: '(max-width:700px) 100vw, 50vw' })}</div>
  </div>
</section>

${h.chapters?.items?.length ? `<section class="section" id="realizacje" data-moment="photo-chapters" aria-labelledby="realizacje-h">
  <div class="wrap mo-ph">
    <div class="mo-ph__head"><h2 id="realizacje-h"${ed(ctx, 'home.chapters.title')}>${esc(h.chapters.title)}</h2><p${ed(ctx, 'home.chapters.lead')}>${esc(h.chapters.lead)}</p></div>
    <ol class="mo-ph__list">
      ${h.chapters.items.map((c, i) => `<li class="mo-ph__ch">
        <figure class="mo-ph__pic"><img src="${esc(url(c.image.src))}" alt="${esc(c.image.alt || '')}" style="object-position:${c.image.x ?? 50}% ${c.image.y ?? 50}%" loading="lazy" decoding="async"${ed(ctx, `home.chapters.items.${i}.image`)}></figure>
        <h3${ed(ctx, `home.chapters.items.${i}.title`)}>${esc(c.title)}</h3>
        <p${ed(ctx, `home.chapters.items.${i}.text`)}>${esc(c.text)}</p>
      </li>`).join('')}
    </ol>
  </div>
</section>` : ''}

${films.length ? `<section class="section ground-surface" id="filmy" aria-labelledby="filmy-h">
  <div class="wrap">
    <div class="section-head section-head--row">
      <div><h2 id="filmy-h"${ed(ctx, 'home.filmsBlock.title')}>${esc(h.filmsBlock.title)}</h2><p${ed(ctx, 'home.filmsBlock.lead')}>${esc(h.filmsBlock.lead)}</p></div>
      <a class="btn btn--secondary" href="${url('filmy/')}">Zobacz wszystkie filmy</a>
    </div>
    <div class="grid grid--top rf-player" data-player>
      <div class="span-6 rf-player__screen">
        <video controls playsinline preload="none" poster="${esc(url(films[0].image?.src))}" src="${esc(url(films[0].file))}" aria-label="${esc(films[0].title)}"></video>
      </div>
      <ul class="rows span-6 start-7 rf-player__list">${films.map((f, k) => {
        const i = portfolio.films.indexOf(f);
        return `<li><button type="button" class="rf-player__item${k ? '' : ' is-on'}" data-src="${esc(url(f.file))}" data-poster="${esc(url(f.image?.src))}"${k ? '' : ' aria-current="true"'}>
          <span class="rows__name"${ed(ctx, `portfolio.films.${i}.title`)}>${esc(f.title)}</span><span class="rows__value">${esc(f.category || '')}</span>
        </button></li>`;
      }).join('')}</ul>
    </div>
  </div>
</section>` : ''}

${h.steps?.items?.length ? `<section class="section ground-surface" id="wspolpraca" aria-labelledby="wspolpraca-h">
  <div class="wrap">
    <div class="section-head"><h2 id="wspolpraca-h"${ed(ctx, 'home.steps.title')}>${esc(h.steps.title)}</h2></div>
    <div class="grid">
      ${h.steps.items.map((s, i) => `<article class="card card--row card--open span-4">
        <span class="step-num">${i + 1}</span>
        <h3${ed(ctx, `home.steps.items.${i}.title`)}>${esc(s.title)}</h3>
        <p${ed(ctx, `home.steps.items.${i}.text`)}>${esc(s.text)}</p>
        <div class="panel rf-step__img">${img(ctx, s.image, { path: `home.steps.items.${i}.image`, cls: 'frame__img', sizes: '(max-width:700px) 100vw, 33vw' })}</div>
      </article>`).join('')}
    </div>
  </div>
</section>` : ''}

${h.statement?.text ? `<section class="section statement" id="o-mnie" data-moment="word-highlight" aria-label="${esc(h.statement.label || 'O mnie')}">
  <div class="wrap">
    <p class="t-label"${ed(ctx, 'home.statement.label')}>${esc(h.statement.label)}</p>
    <p class="mo-wh__text"${ed(ctx, 'home.statement.text')}>${esc(h.statement.text).replace(esc(h.statement.strong || '\u0000'), `<strong>${esc(h.statement.strong)}</strong>`)}</p>
    <p class="rf-after"><a class="link" href="${url('o-mnie/')}">Przeczytaj o mnie</a></p>
  </div>
</section>` : ''}

${bookingSection(ctx)}`;
}

function servicesPage(ctx) {
  const { home } = ctx.data;
  return `${pageHead(ctx, { kicker: 'Oferta', title: home.offer.pageTitle || home.offer.title, lead: home.offer.lead, path: 'home.offer' })}
<section class="rf-sec rf-sec--tight"><div class="wrap"><div class="grid rf-cards">${ctx.data.services.map((s, i) => `
    <a class="card card--open span-4 rf-card" href="${url(`uslugi/${esc(s.slug)}/`)}">
      <div class="panel panel--top rf-card__img">${img(ctx, s.image, { path: `services.${i}.image`, cls: 'frame__img', sizes: '(max-width:700px) 100vw, 33vw' })}</div>
      <h3${ed(ctx, `services.${i}.title`)}>${esc(s.title)}</h3>
      <p${ed(ctx, `services.${i}.short`)}>${esc(s.short)}</p>
    </a>`).join('')}</div></div></section>`;
}

function servicePage(ctx, s) {
  const i = ctx.data.services.indexOf(s);
  const p = `services.${i}`;
  const related = ctx.data.portfolio.items.filter((it) => s.portfolioCategory ? it.category === s.portfolioCategory : true).slice(0, 6);
  const films = s.showFilms ? visibleFilms(ctx.data).filter((f) => !s.filmCategory || f.category === s.filmCategory).slice(0, 6) : [];
  return `
<section class="rf-sec rf-sec--first">
  <div class="wrap grid grid--top">
    <div class="span-5 stack-4">
      <p class="t-label muted"><a href="${url('uslugi/')}">Oferta</a></p>
      <h1${ed(ctx, `${p}.title`)}>${esc(s.title)}</h1>
      <p class="t-lead"${ed(ctx, `${p}.intro`)}>${esc(s.intro)}</p>
      <div class="btn-row"><a class="btn btn--primary" href="${mainHref()}">${MAIN_ACTION}${ARROW}</a></div>
    </div>
    <div class="frame frame--photo span-6 start-7 rf-svc__img">${img(ctx, s.image, { path: `${p}.image`, cls: 'frame__img', eager: true, sizes: '(max-width:700px) 100vw, 50vw' })}</div>
  </div>
</section>
<section class="rf-sec">
  <div class="wrap grid grid--top">
    <div class="span-6 rf-prose">${paras(ctx, s.paragraphs, `${p}.paragraphs`)}</div>
    <div class="span-5 start-8">
      <h2 class="rf-h3">W ramach realizacji</h2>
      <ul class="rows rf-list">${(s.includes || []).map((t, k) => `<li><span class="rows__name"${ed(ctx, `${p}.includes.${k}`)}>${esc(t)}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>
${films.length ? `<section class="rf-sec ground-surface">
  <div class="wrap">
    <div class="section-head section-head--row"><div><h2>Filmy</h2></div><a class="btn btn--secondary" href="${url('filmy/')}">Zobacz wszystkie filmy</a></div>
    ${filmsGrid(ctx, films)}
  </div>
</section>` : ''}
${related.length ? `<section class="rf-sec">
  <div class="wrap">
    <div class="section-head section-head--row"><div><h2>Zdjęcia z realizacji</h2></div><a class="btn btn--secondary" href="${url('portfolio/')}">Zobacz portfolio</a></div>
    ${portfolioGrid(ctx, related)}
  </div>
</section>` : ''}`;
}

function portfolioPage(ctx) {
  const { portfolio } = ctx.data;
  return `${pageHead(ctx, { kicker: 'Realizacje', title: portfolio.title, lead: portfolio.lead, path: 'portfolio' })}
<section class="rf-sec rf-sec--tight"><div class="wrap">${portfolioGrid(ctx, portfolio.items, { filters: true })}</div></section>
${collections(ctx.data).map((c, k) => collectionBlock(ctx, c, { limit: c.vertical ? 4 : 3, alt: k % 2 === 0 })).join('')}`;
}

function aboutPage(ctx) {
  const h = ctx.data.home;
  return `<section class="rf-sec rf-sec--first">
  <div class="wrap grid grid--top">
    <div class="span-6 rf-prose">
      <p class="t-label muted">O mnie</p>
      <h1${ed(ctx, 'home.about.title')}>${esc(h.about.title)}</h1>
      ${paras(ctx, h.about.paragraphs, 'home.about.paragraphs')}${paras(ctx, h.approach.paragraphs, 'home.approach.paragraphs')}
      <div class="btn-row"><a class="btn btn--primary" href="${mainHref()}">${MAIN_ACTION}${ARROW}</a></div>
    </div>
    <div class="frame frame--photo frame--portrait span-5 start-8">${img(ctx, h.about.image, { path: 'home.about.image', cls: 'frame__img', eager: true, sizes: '(max-width:700px) 100vw, 40vw' })}</div>
  </div>
</section>
<section class="rf-sec ground-surface">
  <div class="wrap">
    <div class="section-head"><h2>${esc(h.process.title)}</h2></div>
    <div class="grid">${h.process.steps.map((s, i) => `<article class="card span-4"><span class="step-num">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join('')}</div>
  </div>
</section>`;
}

function blogPage(ctx) {
  const h = ctx.data.home;
  return `${pageHead(ctx, { kicker: h.journal.label, title: 'Dziennik', lead: h.journal.title })}
<section class="rf-sec rf-sec--tight"><div class="wrap">${postCards(ctx, ctx.data.blog.filter((p) => p.published))}</div></section>`;
}

function postPage(ctx, post) {
  const i = ctx.data.blog.indexOf(post);
  return `<article class="rf-sec rf-sec--first">
  <div class="wrap">
    <div class="rf-narrow">
      <p class="t-label muted"><a href="${url('blog/')}">Dziennik</a> · <time datetime="${esc(post.date)}">${formatDate(post.date)}</time></p>
      <h1${ed(ctx, `blog.${i}.title`)}>${esc(post.title)}</h1>
      <p class="t-lead"${ed(ctx, `blog.${i}.excerpt`)}>${esc(post.excerpt)}</p>
    </div>
    <div class="frame frame--photo rf-post__hero">${img(ctx, post.image, { path: `blog.${i}.image`, cls: 'frame__img', eager: true })}</div>
    <div class="rf-narrow rf-prose">${paras(ctx, post.paragraphs, `blog.${i}.paragraphs`)}</div>
  </div>
</article>`;
}

function contactPage(ctx) {
  return bookingSection(ctx, { page: true });
}

function thanksPage() {
  return `<section class="rf-sec rf-sec--first rf-head"><div class="wrap">
    <p class="t-label muted">Wiadomość wysłana</p><h1>Dziękuję za zapytanie</h1>
    <p class="t-lead measure">Odpowiem mailem na adres podany w formularzu.</p>
    <div class="btn-row"><a class="btn btn--secondary" href="${url('portfolio/')}">Zobacz portfolio</a></div>
  </div></section>`;
}

function notFoundPage() {
  return `<section class="rf-sec rf-sec--first rf-head"><div class="wrap">
    <p class="t-label muted">Błąd 404</p><h1>Tej podstrony nie ma</h1>
    <p class="t-lead measure">Mogła zmienić adres po przebudowie strony.</p>
    <div class="btn-row"><a class="btn btn--secondary" href="${url('')}">Wróć na stronę główną</a></div>
  </div></section>`;
}

function privacyPage(ctx) {
  const { site } = ctx.data;
  const films = visibleFilms(ctx.data).some((f) => !f.file); // tylko filmy z YouTube/Vimeo
  const stats = !!String(site.goatcounter || '').trim();
  const admin = [site.legalName || site.name, site.address, site.nip && `NIP: ${site.nip}`].filter(Boolean).map(esc).join(', ');
  const mail = site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : 'adres e-mail podany w zakładce Kontakt';
  return `${pageHead(ctx, { kicker: 'Dokument', title: 'Polityka prywatności', lead: 'Jakie dane przetwarzamy, gdy odwiedzasz stronę lub wysyłasz zapytanie, po co i jak długo – oraz jakie masz prawa.' })}
<section class="rf-sec rf-sec--tight"><div class="wrap"><div class="rf-narrow rf-prose">
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
<p>Strona <strong>nie używa plików cookies</strong> ani narzędzi reklamowych i nie śledzi odwiedzających.${stats ? ' Do liczenia odwiedzin używamy usługi GoatCounter, która nie zapisuje cookies ani adresów IP i pokazuje wyłącznie zbiorcze, anonimowe statystyki (np. liczbę wyświetleń podstron).' : ''}</p>
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
</div></div></section>`;
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

function layout(ctx, { title, description, body, image, jsonld = [], hidden = false, home = false, moments = [] }) {
  if (hidden) ctx = { ...ctx, noindex: true };
  const { site } = ctx.data;
  const canonical = site.url + '/' + ctx.path;
  const share = site.url + abs(image?.src || site.shareImage);
  const k = (p) => asset(`kit/${p}`);
  return `<!doctype html>
<html lang="pl" data-type="service" data-radius="soft" data-buttons="block" data-motion>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${ctx.noindex ? '<meta name="robots" content="noindex,nofollow">\n' : ''}<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="site-kind" content="other">
<meta name="page-type" content="service">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(share)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#eeecea">
<link rel="icon" href="${url(`favicon.ico`)}" sizes="48x48">
<link rel="icon" href="${url(`icon-192.png`)}" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="${url(`apple-touch-icon.png`)}">
<link rel="manifest" href="${url(`site.webmanifest`)}">
<link rel="preload" href="${url(`fonts/host-grotesk-latin.woff2`)}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${k('system.css')}">
<link rel="stylesheet" href="${k('ui/cards.css')}">
<link rel="stylesheet" href="${k('motion/motion.css')}">
<link rel="stylesheet" href="${k('layout/layout.css')}">
<!-- deal: palette three-stones (kamienne tło jak ściana galerii, oliwkowy akcent – kolor dają zdjęcia), pairing Host Grotesk -->
<style>
:root {
  --p-bg: #eeecea; --p-surface: #e4e1dd; --p-ink: #333231; --p-muted: #625f5b;
  --p-accent: #5c6b54; --p-accent-ink: #ffffff; --p-action: #5c6b54; --p-action-ink: #ffffff;
  --p-inv-bg: #333231; --p-inv-surface: #3e3d3c; --p-inv-ink: #eeecea; --p-inv-muted: #adaba9;
  --p-inv-accent: #eeecea; --p-inv-accent-ink: #333231; --p-inv-action: #eeecea; --p-inv-action-ink: #333231;
  --font-display: "Host Grotesk", system-ui, sans-serif;
  --font-text: "Host Grotesk", system-ui, sans-serif;
  --display-weight: 400;
  --display-tracking: -0.035em;
  --display-tracking-xl: -0.04em;
}
</style>
<link rel="stylesheet" href="${asset(`style.css`)}">
<script>document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)</script>
${moments.length ? `<script>document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)</script>
<link rel="modulepreload" href="${k('moments/moments.js')}"><link rel="modulepreload" href="${k('moments/lib.js')}">
${moments.map((m) => `<link rel="modulepreload" href="${k(`moments/${m}/moment.js`)}">`).join('')}` : ''}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<!-- type: service · deal: hero split, nav-mega, close-type, footer-columns, rhythm surface-pairs, buttons block, logo klienta
     moments: photo-chapters (#realizacje), word-highlight (#o-mnie) -->
${header(ctx)}
<main id="top">${home ? body : `<div class="rf-page">${body}</div>`}</main>
${footer(ctx)}
<script type="module" src="${k('system.js')}"></script>
<script type="module" src="${k('motion/motion.js')}"></script>
<script type="module" src="${k('layout/layout.js')}"></script>
<script src="${asset(`site.js`)}" defer></script>
${statsScript(ctx)}</body>
</html>`;
}

/* ---------- Lista wszystkich podstron ---------- */

export function routes(data, { preview = false, base = '', noindex = false, v = '' } = {}) {
  const { site, home, services, portfolio, blog } = data;
  const mk = (path, fn) => ({ path, render: () => { BASE = base; ASSET_V = v; return fn({ data, path, preview, noindex }); } });
  const t = (s) => `${s} | ${site.name}`;
  const crumbs = (items) => ({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${site.url}/${p}` })),
  });

  const list = [
    { path: '', render: () => legacyHome(data, { preview, base, noindex, v }) }, // strona główna: wersja sprzed przebudowy
    mk('uslugi/', (ctx) => layout(ctx, { title: t('Oferta – fotografia, film i dron w Bielsku-Białej'), description: home.offer.lead + ' ' + services.map((s) => s.title).join(', ') + '.', body: servicesPage(ctx) })),
    ...services.map((s) => mk(`uslugi/${s.slug}/`, (ctx) => layout(ctx, { title: s.seoTitle || t(s.title), description: s.seoDescription || s.short, image: s.image, body: servicePage(ctx, s), jsonld: [crumbs([['Oferta', 'uslugi/'], [s.title, `uslugi/${s.slug}/`]])] }))),
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

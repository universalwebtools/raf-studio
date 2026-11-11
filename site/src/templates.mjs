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
const abs = (p) => '/' + String(p || '').replace(/^\/+/, '');
const url = (p) => BASE + abs(p);

// Atrybut łączący element podglądu z polem w edytorze (tylko w trybie podglądu).
const ed = (ctx, path) => (ctx.preview && path ? ` data-edit="${esc(path)}"` : '');

function img(ctx, image, { path = '', cls = '', sizes = '', eager = false } = {}) {
  if (!image || !image.src) return `<div class="ph ${cls}"${ed(ctx, path)}></div>`;
  const x = image.x ?? 50, y = image.y ?? 50;
  return `<img class="${cls}" src="${esc(url(image.src))}" alt="${esc(image.alt || '')}" style="object-position:${x}% ${y}%"` +
    `${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${sizes ? ` sizes="${sizes}"` : ''}${ed(ctx, path)}>`;
}

const paras = (ctx, list, path) => (list || []).map((p, i) => `<p${ed(ctx, `${path}.${i}`)}>${esc(p)}</p>`).join('');

/* ---------- Wspólne elementy ---------- */

function header(ctx, { overlay }) {
  const { site } = ctx.data;
  const links = [
    ['uslugi/', 'Oferta'],
    ['portfolio/', 'Portfolio'],
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

function contactBlock(ctx, { heading = true } = {}) {
  const { site, home, services } = ctx.data;
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
    <form class="form" data-contact-form data-email="${esc(site.email)}">
      <label>Twoje imię<input name="name" autocomplete="name" required></label>
      <label>Adres e-mail<input name="email" type="email" autocomplete="email" required></label>
      <div class="form__row">
        <label>Interesuje mnie<select name="service">${services.map((s) => `<option>${esc(s.title)}</option>`).join('')}<option>Coś innego</option></select></label>
        <label>Planowany termin<input name="date" type="date"></label>
      </div>
      <label>Kilka słów o pomyśle<textarea name="message" rows="4" required></textarea></label>
      <button class="btn btn--dark" type="submit">Wyślij zapytanie</button>
      <p class="form__note">Formularz przygotuje wiadomość w Twoim programie pocztowym. Dane są używane wyłącznie do odpowiedzi na zapytanie – <a href="${url(`polityka-prywatnosci/`)}">polityka prywatności</a>.</p>
    </form>
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

/* ---------- Strony ---------- */

function homePage(ctx) {
  const { home: h, portfolio, blog } = ctx.data;
  const posts = blog.filter((p) => p.published).slice(0, 3);
  return `
<section class="hero">
  <div class="hero__media">
    ${img(ctx, h.hero.image, { path: 'home.hero.image', cls: 'hero__poster', eager: true })}
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

<section class="section section--alt" id="oferta">
  <div class="wrap">
    <div class="section__head">
      <h2${ed(ctx, 'home.offer.title')}>${esc(h.offer.title)}</h2>
      <p class="lead"${ed(ctx, 'home.offer.lead')}>${esc(h.offer.lead)}</p>
    </div>
    ${serviceCards(ctx)}
  </div>
</section>

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

<section class="section">
  <div class="wrap split__grid">
    <div class="split__img split__img--wide">${img(ctx, h.film.image, { path: 'home.film.image', sizes: '(max-width:800px) 100vw, 50vw' })}</div>
    <div class="split__copy">
      <h2${ed(ctx, 'home.film.title')}>${esc(h.film.title)}</h2>
      ${paras(ctx, h.film.paragraphs, 'home.film.paragraphs')}
      <a class="more" href="${url(`uslugi/film/`)}">Film w RAF.studio →</a>
    </div>
  </div>
</section>

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

/* ---------- Szkielet dokumentu ---------- */

function layout(ctx, { title, description, body, image, overlay = false, jsonld = [] }) {
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
<link rel="icon" href="${url(`favicon.png`)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${url(`style.css`)}">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body${overlay ? ' class="has-overlay"' : ''}>
<a class="skip" href="#tresc">Przejdź do treści</a>
${header(ctx, { overlay })}
<main id="tresc">${body}</main>
${footer(ctx)}
<script src="${url(`site.js`)}" defer></script>
</body>
</html>`;
}

/* ---------- Lista wszystkich podstron ---------- */

export function routes(data, { preview = false, base = '', noindex = false } = {}) {
  const { site, home, services, portfolio, blog } = data;
  const mk = (path, fn) => ({ path, render: () => { BASE = base; return fn({ data, path, preview, noindex }); } });
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
    mk('o-mnie/', (ctx) => layout(ctx, { title: t('O mnie'), description: home.about.paragraphs[0], image: home.about.image, body: aboutPage(ctx) })),
    mk('blog/', (ctx) => layout(ctx, { title: t('Dziennik'), description: home.journal.title, body: blogPage(ctx) })),
    ...blog.filter((p) => p.published || preview).map((p) => mk(`blog/${p.slug}/`, (ctx) => layout(ctx, {
      title: t(p.title), description: p.excerpt, image: p.image, body: postPage(ctx, p),
      jsonld: [{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, datePublished: p.date, image: site.url + abs(p.image?.src), author: { '@type': 'Person', name: 'Rafał – RAF.studio' }, publisher: { '@id': site.url + '/#firma' } }],
    }))),
    mk('kontakt/', (ctx) => layout(ctx, { title: t('Kontakt – zapytaj o termin'), description: home.contact.text, body: contactPage(ctx) })),
  ];
  return list;
}

export function notFound(data, { base = '' } = {}) {
  BASE = base;
  const ctx = { data, path: '404.html', preview: false };
  return layout(ctx, { title: `Nie znaleziono | ${data.site.name}`, description: '', body: notFoundPage() }).replace('<head>', '<head>\n<meta name="robots" content="noindex">');
}

// Wszystkie pliki generowane z treści: { "ścieżka/pliku": "zawartość" }.
// Używane przez build.mjs (Node) i przez przycisk „Opublikuj” w edytorze (przeglądarka).
export function renderSite(data, { base = '', noindex = false } = {}) {
  const files = {};
  const pages = routes(data, { base, noindex });
  for (const r of pages) files[r.path + 'index.html'] = r.render();
  files['404.html'] = notFound(data, { base });
  const siteUrl = data.site.url.replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);
  files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((r) => `  <url><loc>${siteUrl}/${r.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
  <url><loc>${siteUrl}/polityka-prywatnosci/</loc></url>
</urlset>
`;
  files['robots.txt'] = noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
  return files;
}

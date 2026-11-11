// RAF.studio – interakcje strony (bez bibliotek).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Menu mobilne
  const burger = $('[data-burger]');
  burger?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('.hdr__nav a').forEach((a) => a.addEventListener('click', () => document.body.classList.remove('nav-open')));

  // Nagłówek przezroczysty nad zdjęciem, ciemny po przewinięciu
  const hdr = $('[data-hdr]');
  if (hdr?.classList.contains('hdr--overlay')) {
    const onScroll = () => hdr.classList.toggle('is-solid', scrollY > 60);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Wideo w nagłówku: wczytywane dopiero po załadowaniu strony,
  // lżejsza wersja na telefon, brak wideo przy oszczędzaniu danych.
  const video = $('.hero__video');
  const toggle = $('[data-video-toggle]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData;
  if (video && !reduce && !saveData && !window.RAF_PREVIEW) {
    const start = () => {
      video.src = innerWidth < 900 ? video.dataset.srcMobile : video.dataset.src;
      video.addEventListener('playing', () => video.classList.add('is-ready'), { once: true });
      video.play().catch(() => {});
    };
    if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
    toggle?.addEventListener('click', () => {
      if (video.paused) { video.play(); toggle.textContent = '❚❚'; toggle.setAttribute('aria-label', 'Zatrzymaj wideo'); }
      else { video.pause(); toggle.textContent = '▶'; toggle.setAttribute('aria-label', 'Odtwórz wideo'); }
    });
  } else {
    toggle?.remove();
  }

  // Filtry portfolio
  $$('.filters').forEach((bar) => {
    const grid = bar.nextElementSibling;
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      $$('button', bar).forEach((x) => x.classList.toggle('is-on', x === b));
      const f = b.dataset.filter;
      $$('.grid__item', grid).forEach((it) => it.classList.toggle('is-hidden', f !== '*' && it.dataset.cat !== f));
    });
  });

  // Powiększanie zdjęć (lightbox)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-lb]');
    if (!a) return;
    e.preventDefault();
    const items = $$('[data-lb]', a.closest('[data-lightbox]')).filter((x) => !x.closest('.is-hidden'));
    let i = items.indexOf(a);
    const box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<img alt=""><button class="lb__close" aria-label="Zamknij">×</button><button class="lb__prev" aria-label="Poprzednie">‹</button><button class="lb__next" aria-label="Następne">›</button>';
    const im = $('img', box);
    const show = () => { im.src = items[i].href; im.alt = $('img', items[i])?.alt || ''; };
    const close = () => { box.remove(); removeEventListener('keydown', key); };
    const step = (d) => { i = (i + d + items.length) % items.length; show(); };
    const key = (ev) => { if (ev.key === 'Escape') close(); if (ev.key === 'ArrowRight') step(1); if (ev.key === 'ArrowLeft') step(-1); };
    box.addEventListener('click', (ev) => {
      if (ev.target.closest('.lb__next')) step(1);
      else if (ev.target.closest('.lb__prev')) step(-1);
      else if (ev.target === box || ev.target.closest('.lb__close')) close();
    });
    addEventListener('keydown', key);
    show();
    document.body.append(box);
    $('.lb__close', box).focus();
  });

  // Formularz kontaktowy → e-mail przez FormSubmit (bez przeładowania strony).
  // Bez JavaScriptu formularz wysyła się zwykłym POST-em i wraca na stronę z podziękowaniem.
  $$('[data-contact-form]').forEach((form) => form.addEventListener('submit', async (e) => {
    if (window.RAF_PREVIEW) { e.preventDefault(); return; }
    e.preventDefault();
    const status = $('.form__status', form);
    const btn = $('button[type=submit]', form);
    const data = new FormData(form);
    if (data.get('_honey')) return; // pułapka na boty
    data.set('_replyto', data.get('email'));
    btn.disabled = true;
    status.className = 'form__status';
    status.textContent = 'Wysyłanie…';
    try {
      const res = await fetch(form.dataset.endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || String(out.success) !== 'true') throw new Error(out.message || 'Błąd wysyłki');
      form.classList.add('is-sent');
      status.classList.add('is-ok');
      status.textContent = 'Dziękuję! Wiadomość dotarła – odpowiem najszybciej, jak to możliwe.';
    } catch (err) {
      status.classList.add('is-err');
      const mail = form.action.split('/').pop();
      status.innerHTML = '';
      status.append('Nie udało się wysłać wiadomości. Spróbuj ponownie albo napisz bezpośrednio na ');
      const a = document.createElement('a'); a.href = 'mailto:' + mail; a.textContent = mail; status.append(a, '.');
      btn.disabled = false;
    }
  }));

  // Filmy: odtwarzacz YouTube/Vimeo wczytywany dopiero po kliknięciu.
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.film__play');
    if (!b || window.RAF_PREVIEW) return;
    let f;
    if (b.dataset.video) {
      f = document.createElement('video');
      f.src = b.dataset.video;
      if (b.dataset.poster) f.poster = b.dataset.poster;
      f.controls = true; f.autoplay = true; f.playsInline = true;
      f.setAttribute('aria-label', b.getAttribute('aria-label') || 'Film');
    } else {
      f = document.createElement('iframe');
      f.src = b.dataset.embed;
      f.title = b.getAttribute('aria-label') || 'Film';
      f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      f.allowFullscreen = true;
    }
    const holder = document.createElement('div');
    holder.className = 'film__play';
    holder.append(f);
    b.closest('.film')?.classList.add('is-playing');
    b.replaceWith(holder);
  });

  // Delikatne pojawianie się sekcji
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.section__head, .card, .split__img, .split__copy, .steps li, .post-card, .grid__item').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }
})();

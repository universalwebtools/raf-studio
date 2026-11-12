// RAF.studio – interakcje strony (bez bibliotek).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Menu, nagłówek, formularz i animacje obsługuje system.js (/kit/).

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
      if (video.paused) { video.play(); toggle.textContent = '❚❚'; toggle.setAttribute('aria-label', 'Zatrzymaj film'); }
      else { video.pause(); toggle.textContent = '▶'; toggle.setAttribute('aria-label', 'Odtwórz film'); }
    });
  } else {
    toggle?.remove();
  }

  // Filtry portfolio
  $$('.rf-chips:not(.rf-chips--nav)').forEach((bar) => {
    const grid = bar.nextElementSibling;
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      $$('button', bar).forEach((x) => x.classList.toggle('is-on', x === b));
      const f = b.dataset.filter;
      $$('.rf-gallery__item', grid).forEach((it) => it.classList.toggle('is-hidden', f !== '*' && it.dataset.cat !== f));
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

  // Stary formularz (data-contact-form) – zostaje tylko dla stron sprzed przebudowy w pamięci przeglądarki.
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
    const b = e.target.closest('button.film__play');
    if (!b || window.RAF_PREVIEW || !(b.dataset.video || b.dataset.embed)) return;
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
    stopOtherFilms(f);
    b.replaceWith(holder);
  });

  // Odtwarzacz z listą filmów (strona główna): wybór z listy wczytuje film do kadru.
  $$('[data-player]').forEach((box) => {
    const v = $('.rf-player__screen video', box);
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.rf-player__item');
      if (!b || window.RAF_PREVIEW) return;
      $$('.rf-player__item', box).forEach((x) => { x.classList.toggle('is-on', x === b); x.toggleAttribute('aria-current', x === b); });
      v.poster = b.dataset.poster || '';
      v.src = b.dataset.src;
      v.setAttribute('aria-label', b.textContent.trim());
      v.play().catch(() => {});
    });
  });

  // Tylko jeden film naraz: start jednego zatrzymuje pozostałe.
  function stopOtherFilms(current) {
    $$('.film video').forEach((v) => { if (v !== current && !v.paused) v.pause(); });
    // YouTube/Vimeo nie da się zapauzować z zewnątrz – przeładowanie odtwarzacza go zatrzymuje.
    $$('.film iframe').forEach((fr) => { if (fr !== current) fr.src = fr.src; });
  }
  document.addEventListener('play', (e) => {
    if (e.target.matches?.('.film video')) stopOtherFilms(e.target);
  }, true);

  // Rolki w stylu Shorts: widoczna rolka gra, przewinięcie = następna.
  $$('[data-shorts]').forEach((feed) => {
    const track = $('.shorts__track', feed);
    const items = $$('.short', feed);
    if (!items.length) return;
    // Dźwięk zawsze włączony. Jeśli przeglądarka zablokuje start z dźwiękiem
    // (zanim ktoś dotknie strony), film rusza bez dźwięku, a dźwięk włącza się
    // sam przy pierwszym dotknięciu, kliknięciu lub klawiszu.
    let current = null;
    let blocked = false;
    const load = (el) => { const v = $('video', el); if (v && !v.src) { v.src = el.dataset.src; v.preload = 'auto'; } return v; };
    const play = (el) => {
      const v = load(el);
      v.muted = false;
      v.play().then(() => el.classList.remove('is-paused')).catch(() => {
        blocked = true;
        v.muted = true;
        v.play().catch(() => el.classList.add('is-paused'));
      });
    };
    const unlock = () => {
      if (!blocked) return;
      blocked = false;
      items.forEach((el) => { $('video', el).muted = false; });
      if (current && $('video', current).paused) play(current);
    };
    ['pointerdown', 'keydown', 'touchend'].forEach((ev) => document.addEventListener(ev, unlock, { capture: true }));
    const activate = (el) => {
      if (el === current) return;
      current = el;
      items.forEach((o) => { if (o !== el) { const v = $('video', o); if (v.src) { v.pause(); v.currentTime = 0; } o.classList.remove('is-paused'); } });
      $$('.film video').forEach((v) => v.pause());
      play(el);
      const next = items[items.indexOf(el) + 1]; if (next) load(next); // wczytaj z wyprzedzeniem
      updateNav();
      if (history.replaceState) history.replaceState(null, '', '#' + el.dataset.id);
    };
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting && en.intersectionRatio > 0.6) activate(en.target); }), { root: track, threshold: [0.6] });
    items.forEach((el) => {
      io.observe(el);
      const v = $('video', el);
      v.addEventListener('click', () => {
        if (v.paused) { v.muted = false; v.play(); el.classList.remove('is-paused'); } else { v.pause(); el.classList.add('is-paused'); }
      });
      v.addEventListener('timeupdate', () => { $('.short__progress span', el).style.width = (v.currentTime / (v.duration || 1)) * 100 + '%'; });
    });
    const go = (d) => { const i = items.indexOf(current) + d; if (items[i]) track.scrollTo({ top: items[i].offsetTop, behavior: 'smooth' }); };
    // Odtwarzacz wypełnia ekran pod nagłówkiem strony i tytułem sekcji.
    const fit = () => {
      const top = ($('header.nav')?.offsetHeight || 0) + ($('.shorts-head')?.offsetHeight || 0);
      track.style.height = `calc(100svh - ${top}px)`;
    };
    fit(); addEventListener('resize', fit);
    const nav = $$('.shorts__nav button', feed);
    function updateNav() { const i = items.indexOf(current); if (nav.length) { nav[0].disabled = i <= 0; nav[1].disabled = i >= items.length - 1; } }
    nav.forEach((b) => b.addEventListener('click', () => go(+b.dataset.dir)));
    addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      if (e.key === ' ' && current) { e.preventDefault(); $('video', current).click(); }
    });
    // Start od rolki z adresu (#nazwa), np. po kliknięciu miniatury.
    const want = decodeURIComponent(location.hash.slice(1));
    const start = want && items.find((el) => el.dataset.id === want);
    if (start) track.scrollTop = start.offsetTop;
  });

})();

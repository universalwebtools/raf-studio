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

  // Tylko jeden film naraz: start jednego zatrzymuje pozostałe.
  function stopOtherFilms(current) {
    $$('.film video').forEach((v) => { if (v !== current && !v.paused) v.pause(); });
    // YouTube/Vimeo nie da się zapauzować z zewnątrz – przeładowanie odtwarzacza go zatrzymuje.
    $$('.film iframe').forEach((fr) => { if (fr !== current) fr.src = fr.src; });
  }
  document.addEventListener('play', (e) => {
    if (e.target.matches?.('.film video:not(.wg-hover)')) stopOtherFilms(e.target);
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
      const top = ($('[data-hdr]')?.offsetHeight || 0) + ($('.shorts-head')?.offsetHeight || 0);
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

  /* ---------- Widżety (włączane w edytorze) ---------- */
  const raf = (fn) => { let t = 0; return () => { if (!t) t = requestAnimationFrame(() => { t = 0; fn(); }); }; };
  const progress = (el) => { const r = el.getBoundingClientRect(); const d = r.height - innerHeight; return d > 0 ? Math.min(1, Math.max(0, -r.top / d)) : 0; };

  // Pozioma galeria: sekcja ma wysokość zależną od szerokości paska, pasek przesuwa się w bok.
  $$('[data-wg-hscroll]').forEach((sec) => {
    const track = $('.wg-hscroll__track', sec);
    if (reduce) { sec.classList.add('is-static'); return; }
    const size = () => { const extra = Math.max(0, track.scrollWidth - innerWidth); sec.style.height = `calc(100svh + ${extra}px)`; sec.dataset.extra = extra; upd(); };
    const upd = raf(() => { track.style.transform = `translate3d(${-progress(sec) * (+sec.dataset.extra || 0)}px,0,0)`; });
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', size);
    addEventListener('load', size, { once: true });
    size();
  });

  // Rozdziały: zdjęcie zmienia się razem z aktywnym akapitem.
  $$('[data-wg-chapters]').forEach((sec) => {
    const imgs = $$('.wg-chapters__img', sec);
    const steps = $$('.wg-chapters__step', sec);
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      const i = steps.indexOf(en.target);
      steps.forEach((s, j) => s.classList.toggle('is-on', j === i));
      imgs.forEach((m, j) => m.classList.toggle('is-on', j === i));
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
  });

  // Zbliżenie nagłówka przy przewijaniu.
  $$('[data-wg-zoom]').forEach((hero) => {
    if (reduce) return;
    const media = $('.hero__media', hero);
    const upd = raf(() => {
      const p = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight || 1)));
      media.style.transform = `scale(${1 + p * 0.18})`;
      media.style.opacity = String(1 - p * 0.35);
    });
    addEventListener('scroll', upd, { passive: true });
    upd();
  });

  // Suwak przed/po.
  $$('[data-wg-ba]').forEach((fr) => {
    const r = $('input', fr);
    const set = () => fr.style.setProperty('--pos', r.value + '%');
    r.addEventListener('input', set);
    set();
  });

  // Podgląd filmu po najechaniu myszką (tylko komputer).
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce && !saveData) {
    $$('[data-wg-hover]').forEach((fig) => {
      let v = null;
      fig.addEventListener('mouseenter', () => {
        if (fig.classList.contains('is-playing')) return;
        if (!v) {
          v = document.createElement('video');
          v.className = 'wg-hover'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.setAttribute('aria-hidden', 'true');
          v.src = fig.dataset.wgHover;
          $('.film__play', fig)?.append(v);
          v.addEventListener('playing', () => v.classList.add('is-on'));
        }
        v.play().catch(() => {});
      });
      fig.addEventListener('mouseleave', () => { if (v) { v.pause(); v.classList.remove('is-on'); } });
      fig.addEventListener('click', () => { v?.remove(); v = null; }, true);
    });
  }

  // Karuzela opinii: strzałki + automatyczne przewijanie (zatrzymane po najechaniu).
  $$('[data-wg-reviews]').forEach((sec) => {
    const track = $('.wg-rev__track', sec);
    const go = (d) => {
      const card = track.firstElementChild; if (!card) return;
      const w = card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
      const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      track.scrollTo({ left: d > 0 && end ? 0 : track.scrollLeft + d * w, behavior: 'smooth' });
    };
    $$('.wg-rev__nav button', sec).forEach((b) => b.addEventListener('click', () => go(+b.dataset.dir)));
    let hold = false;
    sec.addEventListener('mouseenter', () => { hold = true; });
    sec.addEventListener('mouseleave', () => { hold = false; });
    sec.addEventListener('focusin', () => { hold = true; });
    if (!reduce) setInterval(() => { if (!hold && !document.hidden && track.scrollWidth > track.clientWidth + 4) go(1); }, 6000);
  });

  // Liczniki – liczą od zera, gdy pojawią się na ekranie.
  const counters = $$('[data-wg-count]');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target, to = +el.dataset.wgCount, suffix = el.textContent.replace(/^[\d\s]+/, ''), t0 = performance.now();
      const tick = (t) => { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - (1 - p) ** 3)) + suffix; if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  // Kalendarz wolnych terminów – zawsze od bieżącego miesiąca.
  $$('[data-wg-calendar]').forEach((box) => {
    const busy = new Set((box.dataset.busy || '').split(',').filter(Boolean));
    const n = +box.dataset.months || 3;
    const names = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const pad = (x) => String(x).padStart(2, '0');
    let html = '';
    for (let m = 0; m < n; m++) {
      const first = new Date(today.getFullYear(), today.getMonth() + m, 1);
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      const lead = (first.getDay() + 6) % 7; // poniedziałek = 0
      let cells = '<span class="wg-cal__dow">Pn</span><span class="wg-cal__dow">Wt</span><span class="wg-cal__dow">Śr</span><span class="wg-cal__dow">Cz</span><span class="wg-cal__dow">Pt</span><span class="wg-cal__dow">So</span><span class="wg-cal__dow">Nd</span>';
      cells += '<span></span>'.repeat(lead);
      for (let d = 1; d <= days; d++) {
        const date = new Date(first.getFullYear(), first.getMonth(), d);
        const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(d)}`;
        const cls = date < today ? 'is-past' : busy.has(iso) ? 'is-busy' : 'is-free';
        cells += `<span class="wg-cal__d ${cls}" title="${cls === 'is-busy' ? 'Zajęty' : cls === 'is-free' ? 'Wolny' : ''}">${d}</span>`;
      }
      html += `<div class="wg-cal__month"><h3>${names[first.getMonth()]} ${first.getFullYear()}</h3><div class="wg-cal__grid">${cells}</div></div>`;
    }
    box.innerHTML = html;
  });

  // Mapa – wczytywana dopiero po kliknięciu (bez połączeń z OpenStreetMap wcześniej).
  $$('[data-wg-map]').forEach((box) => {
    $('button', box)?.addEventListener('click', () => {
      if (window.RAF_PREVIEW) return;
      const f = document.createElement('iframe');
      f.src = box.dataset.wgMap; f.title = 'Mapa obszaru działania'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer';
      box.replaceChildren(f);
    });
  });

  // Delikatne pojawianie się sekcji
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.section__head, .card, .split__img, .split__copy, .steps li, .post-card, .grid__item').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }
})();

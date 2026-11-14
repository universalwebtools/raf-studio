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
    // Pułapka na boty działa po stronie FormSubmit przy zwykłej wysyłce (bez JS).
    // Tu ją pomijamy, bo autouzupełnianie przeglądarki potrafi ją wypełnić i wiadomość by przepadła.
    data.delete('_honey');
    data.set('_replyto', data.get('email'));
    btn.disabled = true;
    status.className = 'form__status';
    status.textContent = 'Wysyłanie…';
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(form.dataset.endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data, signal: ctrl.signal });
      clearTimeout(timer);
      const out = await res.json().catch(() => ({}));
      if (!res.ok || String(out.success) !== 'true') throw new Error(out.message || 'Błąd wysyłki');
      form.classList.add('is-sent');
      form.scrollIntoView({ block: 'center', behavior: 'smooth' });
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

  // Cytat na zdjęciu – zdjęcie przesuwa się wolniej niż strona.
  $$('[data-wg-parallax]').forEach((sec) => {
    if (reduce) return;
    const bg = $('.wg-quote__bg', sec);
    const upd = raf(() => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2); // -1…1
      bg.style.transform = `translate3d(0,${(-p * 9).toFixed(2)}%,0)`;
    });
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  });

  // Pasek postępu przewijania.
  $$('[data-wg-progress]').forEach((bar) => {
    const fill = $('span', bar);
    const upd = raf(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      fill.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    });
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  });

  // Przycisk „do góry” – pojawia się po przewinięciu.
  $$('[data-wg-top]').forEach((btn) => {
    const upd = raf(() => btn.classList.toggle('is-on', scrollY > 700));
    addEventListener('scroll', upd, { passive: true });
    btn.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
    upd();
  });

  // Ogłoszenie w rogu – po zamknięciu nie wraca do końca wizyty.
  $$('[data-wg-notice]').forEach((box) => {
    const key = 'raf-notice-' + box.dataset.wgNotice;
    let closed = false;
    try { closed = sessionStorage.getItem(key) === '1'; } catch {}
    if (!closed && box.hidden) setTimeout(() => { box.hidden = false; }, 1800);
    $('button', box)?.addEventListener('click', () => {
      if (window.RAF_PREVIEW) return;
      box.hidden = true;
      try { sessionStorage.setItem(key, '1'); } catch {}
    });
  });

  /* ---------- Widżety, część druga ---------- */
  const fx = (document.body.dataset.wgFx || '').split(' ');
  const demo = window.RAF_PREVIEW ? document.body.dataset.wgDemo : '';
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const onView = (el, fn, opts = { threshold: 0.3 }) => {
    if (!('IntersectionObserver' in window)) { fn(true); return; }
    new IntersectionObserver((es) => es.forEach((en) => fn(en.isIntersecting, en)), opts).observe(el);
  };

  // Stykówka: przeciąganie paska myszką.
  $$('.wg-sheet__strip').forEach((strip) => {
    let down = false, moved = 0, x0 = 0, s0 = 0;
    strip.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; x0 = e.clientX; s0 = strip.scrollLeft; });
    addEventListener('pointermove', (e) => { if (!down) return; moved = Math.abs(e.clientX - x0); strip.scrollLeft = s0 - (e.clientX - x0); });
    addEventListener('pointerup', () => { down = false; });
    strip.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    strip.addEventListener('dragstart', (e) => e.preventDefault());
  });

  // Ciemnia: odbitki wywołują się po kolei, gdy sekcja wjedzie na ekran.
  $$('[data-wg-develop]').forEach((sec) => {
    if (reduce) return;
    sec.classList.add('is-armed');
    const prints = $$('.wg-dark__print', sec);
    let done = false;
    onView(sec, (vis) => {
      if (!vis || done) return;
      done = true;
      prints.forEach((el, i) => setTimeout(() => el.classList.add('is-in'), 250 + i * 700));
    }, { threshold: 0.35 });
  });

  // Latarka: plama światła idzie za kursorem; bez myszki krąży sama.
  $$('[data-wg-torch]').forEach((sec) => {
    let manual = false, t0 = performance.now(), vis = false;
    const set = (x, y) => { sec.style.setProperty('--x', x + 'px'); sec.style.setProperty('--y', y + 'px'); };
    sec.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; manual = true; const r = sec.getBoundingClientRect(); set(e.clientX - r.left, e.clientY - r.top); });
    sec.addEventListener('pointerleave', () => { manual = false; });
    if (reduce) return;
    const loop = (t) => {
      if (!vis) return;
      if (!manual) { const k = (t - t0) / 1000, w = sec.clientWidth, hh = sec.clientHeight; set(w * (0.5 + 0.34 * Math.sin(k * 0.55)), hh * (0.45 + 0.24 * Math.sin(k * 0.9 + 1))); }
      requestAnimationFrame(loop);
    };
    onView(sec, (v) => { const was = vis; vis = v; if (v && !was) requestAnimationFrame(loop); }, { threshold: 0 });
  });

  // Stos odbitek: wierzchnie zdjęcie odjeżdża w bok i wraca na spód.
  $$('[data-wg-stack]').forEach((pile) => {
    let cards = $$('.wg-stack__card', pile), busy = false;
    const lay = () => cards.forEach((c, k) => { c.style.zIndex = cards.length - k; c.style.setProperty('--k', Math.min(k, 4)); });
    const next = () => {
      if (busy || cards.length < 2) return;
      busy = true;
      const top = cards[0];
      top.classList.add('is-out');
      setTimeout(() => { cards = [...cards.slice(1), top]; lay(); top.classList.remove('is-out'); busy = false; }, reduce ? 0 : 330);
    };
    pile.addEventListener('click', next);
    $('[data-wg-stack-next]', pile.closest('section'))?.addEventListener('click', next);
    lay();
  });

  // Mozaika: kafelki zdjęcia składają się w całość wraz z przewijaniem.
  $$('[data-wg-mosaic]').forEach((sec) => {
    const frame = $('.wg-mosaic__frame', sec), pic = $('img', frame);
    if (reduce || !pic) { sec.classList.add('is-static'); return; }
    const COLS = 6, ROWS = 4, tiles = [];
    // Stały „losowy” rozrzut – taki sam przy każdym wejściu.
    const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const build = () => {
      if (pic.naturalWidth) frame.style.setProperty('--ar', Math.max(0.7, Math.min(2.4, pic.naturalWidth / pic.naturalHeight)).toFixed(3));
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const el = document.createElement('i'), n = r * COLS + c;
        el.className = 'wg-mosaic__tile';
        el.style.cssText = `left:${c * 100 / COLS}%;top:${r * 100 / ROWS}%;width:${100 / COLS + 0.15}%;height:${100 / ROWS + 0.15}%;background-image:url("${frame.dataset.src}");background-size:${COLS * 100}% ${ROWS * 100}%;background-position:${c * 100 / (COLS - 1)}% ${r * 100 / (ROWS - 1)}%`;
        frame.append(el);
        tiles.push({ el, dx: (rnd(n) - 0.5) * 900, dy: (rnd(n + 50) - 0.5) * 700, rot: (rnd(n + 99) - 0.5) * 140, delay: rnd(n + 7) * 0.35 });
      }
      frame.classList.add('is-tiled');
      upd();
    };
    const upd = raf(() => {
      const p = Math.min(1, progress(sec) / 0.8);
      tiles.forEach((t) => {
        const q = Math.min(1, Math.max(0, (p - t.delay) / (1 - 0.35))), e = 1 - (1 - q) ** 3, k = 1 - e;
        t.el.style.transform = `translate3d(${t.dx * k}px,${t.dy * k}px,0) rotate(${t.rot * k}deg) scale(${1 - 0.35 * k})`;
        t.el.style.opacity = String(0.15 + 0.85 * e);
      });
    });
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    if (pic.complete && pic.naturalWidth) build(); else pic.addEventListener('load', build, { once: true });
  });

  // Oś czasu filmu: klipy mają szerokość proporcjonalną do długości sceny, kliknięcie przeskakuje do niej.
  $$('[data-wg-timeline]').forEach((box) => {
    const v = $('video', box), clips = $$('.wg-tl__clip', box), head = $('.wg-tl__head', box), time = $('[data-wg-tl-time]', box);
    const fmt = (n) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
    const start = (t) => {
      // preload="none" – samo ustawienie adresu niczego nie wczyta, trzeba to wymusić.
      if (!v.src) { v.preload = 'auto'; v.src = box.dataset.src; v.controls = true; box.classList.add('is-started'); v.load(); }
      const go = () => { if (t != null) v.currentTime = t; v.play().catch(() => {}); };
      if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true });
    };
    $('.wg-tl__start', box)?.addEventListener('click', () => start(null));
    clips.forEach((c) => c.addEventListener('click', () => start(+c.dataset.t)));
    v.addEventListener('loadedmetadata', () => {
      clips.forEach((c, i) => { const end = clips[i + 1] ? +clips[i + 1].dataset.t : v.duration; c.style.flexGrow = String(Math.max(0.6, end - +c.dataset.t)); });
    });
    v.addEventListener('timeupdate', () => {
      if (!v.duration) return;
      const t = v.currentTime;
      time.textContent = `${fmt(t)} / ${fmt(v.duration)}`;
      let on = -1;
      clips.forEach((c, i) => { if (t >= +c.dataset.t) on = i; });
      clips.forEach((c, i) => c.classList.toggle('is-on', i === on));
      // Głowica stoi nad właściwym klipem, w miejscu odpowiadającym postępowi sceny.
      const c = clips[on];
      if (c) { const end = clips[on + 1] ? +clips[on + 1].dataset.t : v.duration, k = Math.min(1, (t - +c.dataset.t) / Math.max(0.1, end - +c.dataset.t)); head.style.left = (c.offsetLeft + c.offsetWidth * k) + 'px'; }
    });
    document.addEventListener('play', (e) => { if (e.target !== v && e.target.matches?.('.film video:not(.wg-hover)')) v.pause(); }, true);
  });

  // Klaps: krótka animacja klapsa filmowego z tytułem, zanim ruszy film.
  if (fx.includes('clapper')) {
    const clap = (fig) => {
      const holder = $('.film__play', fig);
      if (!holder || $('.wg-clap', fig)) return;
      const title = $('figcaption strong', fig)?.textContent || (holder.getAttribute('aria-label') || '').replace(/^Odtwórz film:\s*/, '');
      const cat = $('figcaption small', fig)?.textContent || 'Film';
      const el = document.createElement('div');
      el.className = 'wg-clap'; el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<div class="wg-clap__box"><div class="wg-clap__arm"></div><div class="wg-clap__top"></div><div class="wg-clap__board"><span>Produkcja: RAF.studio</span><b></b><span></span></div></div>';
      $('b', el).textContent = title;
      $('.wg-clap__board span:last-child', el).textContent = `${cat} · ujęcie 1`;
      holder.append(el);
      setTimeout(() => el.remove(), 1500);
    };
    document.addEventListener('click', (e) => {
      const b = e.target.closest('button.film__play');
      const fig = b?.closest('figure.film');
      if (fig) setTimeout(() => clap(fig), 0); // po podmianie przycisku na odtwarzacz
    });
    if (demo === 'clapper') {
      const fig = $('figure.film');
      if (fig) setTimeout(() => { fig.scrollIntoView({ block: 'center', behavior: 'instant' }); clap(fig); }, 700);
    }
  }

  // Ściana rolek: filmy grają po kolei, po kilka sekund, bez dźwięku.
  $$('[data-wg-reelwall]').forEach((sec) => {
    const phones = $$('.wg-reels__phone', sec);
    if (!phones.length) return;
    if (reduce || saveData) { phones[0].classList.add('is-on'); return; }
    let i = -1, timer = 0, vis = false;
    const step = () => {
      const prev = phones[i];
      if (prev) { prev.classList.remove('is-on', 'is-playing'); $('video', prev).pause(); }
      i = (i + 1) % phones.length;
      const ph = phones[i], v = $('video', ph);
      ph.classList.add('is-on');
      if (!v.src) { v.src = ph.dataset.src; v.addEventListener('playing', () => { if (phones[i] === ph) ph.classList.add('is-playing'); }); }
      else if (!v.paused || v.readyState > 2) ph.classList.add('is-playing');
      v.play().then(() => { if (phones[i] === ph) ph.classList.add('is-playing'); }).catch(() => {});
      if (innerWidth < 800) ph.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    };
    onView(sec, (v) => {
      if (v === vis) return;
      vis = v;
      clearInterval(timer);
      if (v) { step(); timer = setInterval(step, 4500); }
      else if (phones[i]) { $('video', phones[i]).pause(); }
    }, { threshold: 0.4 });
  });

  // Pas z filmem w tle: wideo wczytuje się dopiero, gdy pas jest na ekranie.
  $$('[data-wg-vband]').forEach((sec) => {
    if (reduce || saveData) return;
    const v = $('video', sec);
    v.addEventListener('playing', () => sec.classList.add('is-playing'));
    onView(sec, (vis) => {
      if (vis) { if (!v.src) v.src = sec.dataset.src; v.play().catch(() => {}); } else v.pause();
    }, { threshold: 0.15 });
  });

  // Wysokościomierz: kadr oddala się (wznoszenie), licznik pokazuje metry.
  $$('[data-wg-alt]').forEach((sec) => {
    if (reduce) { sec.classList.add('is-static'); return; }
    const pic = $('.wg-alt__img', sec), num = $('[data-wg-alt-n]', sec), scale = $('.wg-alt__scale', sec), max = +sec.dataset.max || 120;
    const upd = raf(() => {
      const p = Math.min(1, progress(sec) / 0.85), e = 1 - (1 - p) ** 2;
      pic.style.transform = `scale(${(3 - 2 * e).toFixed(4)})`;
      num.textContent = String(Math.round(max * e));
      scale.style.setProperty('--p', e.toFixed(3));
    });
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  });

  // Trasa lotu: linia rysuje się, znacznik drona leci po niej, numery ujęć pojawiają się po drodze.
  $$('[data-wg-path]').forEach((map) => {
    const path = $('path', map), drone = $('.wg-path__drone', map), pts = $$('.wg-path__pt', map);
    if (reduce || !path || !path.getTotalLength) return;
    const len = path.getTotalLength();
    // W którym miejscu linii (0…1) leży każdy punkt.
    const at = pts.map((el) => {
      const x = parseFloat(el.style.left), y = parseFloat(el.style.top);
      let best = 0, bd = Infinity;
      for (let k = 0; k <= 240; k++) { const q = path.getPointAtLength(len * k / 240), d = (q.x / 16 - x) ** 2 + (q.y / 9 - y) ** 2; if (d < bd) { bd = d; best = k / 240; } }
      return best;
    });
    map.classList.add('is-armed');
    path.style.strokeDashoffset = '1';
    let done = false;
    onView(map, (vis) => {
      if (!vis || done) return;
      done = true;
      const t0 = performance.now(), dur = 900 + pts.length * 700;
      map.classList.add('is-flying');
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = p < 0.5 ? 2 * p * p : 1 - (2 - 2 * p) ** 2 / 2;
        path.style.strokeDashoffset = String(1 - e);
        const q = path.getPointAtLength(len * e);
        drone.style.left = (q.x / 16) + '%'; drone.style.top = (q.y / 9) + '%'; // SVG ma skalę 1600×900
        pts.forEach((el, i) => el.classList.toggle('is-on', e >= at[i] - 0.005));
        if (p < 1) requestAnimationFrame(tick); else setTimeout(() => map.classList.remove('is-flying'), 600);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.45 });
  });

  // Kursor-celownik: ramka wizjera zamiast strzałki; nad zdjęciem i filmem „łapie ostrość”.
  if (fx.includes('cursor') && finePointer) {
    const cur = document.createElement('div');
    cur.className = 'wg-cur'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<i></i><i></i><i></i><i></i><b></b>';
    document.body.append(cur);
    document.documentElement.classList.add('wg-cursor-on');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, run = false;
    const loop = () => {
      cx += (x - cx) * (reduce ? 1 : 0.35); cy += (y - cy) * (reduce ? 1 : 0.35);
      cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      if (Math.abs(x - cx) + Math.abs(y - cy) > 0.3) requestAnimationFrame(loop); else run = false;
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      x = e.clientX; y = e.clientY;
      const t = e.target.closest ? e.target : null;
      const field = t?.closest('input, textarea, select, iframe');
      cur.classList.toggle('is-visible', !field);
      cur.classList.toggle('is-focus', !!t?.closest('img, video, .film__play, .wg-torch, [data-lb]'));
      cur.classList.toggle('is-link', !!t?.closest('a, button, summary, [role=button]') && !t?.closest('img, video, .film__play, [data-lb]'));
      if (!run) { run = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('is-visible'));
    if (demo === 'cursor') { cur.classList.add('is-visible'); cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; }
  }

  // Migawka: zasłona zamyka się po kliknięciu linku do innej podstrony i otwiera na nowej.
  const shut = $('[data-wg-shutter]');
  if (shut && !reduce) {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href]');
      if (!a || a.target || a.hasAttribute('download') || a.hasAttribute('data-lb')) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      if (/\.(webp|jpe?g|png|mp4|pdf)$/i.test(u.pathname)) return;
      e.preventDefault();
      try { sessionStorage.setItem('raf-shut', '1'); } catch {}
      shut.classList.add('is-closing');
      setTimeout(() => { location.href = u.href; }, 280);
    });
    // Powrót „wstecz” z pamięci przeglądarki – zasłona nie może zostać zamknięta.
    addEventListener('pageshow', (e) => { if (e.persisted) shut.classList.remove('is-closing'); });
    if (demo === 'shutter') setTimeout(() => { shut.classList.add('is-closing'); setTimeout(() => shut.classList.remove('is-closing'), 520); }, 600);
  }

  // Delikatne pojawianie się sekcji
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.section__head, .card, .split__img, .split__copy, .steps li, .post-card, .grid__item').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }
})();

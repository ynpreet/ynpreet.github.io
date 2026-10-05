(() => {
  // Free Google Analytics 4 integration.
  const GA_MEASUREMENT_ID = 'G-STZRGV7QX4';

  const loadAnalytics = () => {
    if (!/^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

    // Event delegation: also catches links added to the page later
    // (e.g. the Substack article cards rendered by substack-feed.js).
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      {
        const href = link.href;
        const label = (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
        let eventName = 'link_click';
        if (/substack\.com/i.test(href)) eventName = 'substack_click';
        else if (/resources\.html/i.test(href)) eventName = 'resource_click';
        else if (/blog\.html/i.test(href)) eventName = 'blog_click';
        else if (/linkedin\.com/i.test(href)) eventName = 'linkedin_click';
        else if (/\.pdf($|[?#])/i.test(href)) eventName = 'resume_download';

        window.gtag('event', eventName, {
          link_url: href,
          link_text: label,
          page_path: window.location.pathname
        });
      }
    });
  };

  loadAnalytics();

  /* ---------- header / nav ---------- */
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  const links = [...document.querySelectorAll('.nav a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const updateHeader = () => header && header.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  links.forEach(link => link.addEventListener('click', () => {
    header.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => navObserver.observe(section));

  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineHover = window.matchMedia('(hover: hover)').matches;

  /* ---------- scroll reveal ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- section title wipe ---------- */
  const titleObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('.section-title').forEach(t => titleObserver.observe(t));

  /* ---------- hero video: fallback + play/pause ---------- */
  const video = document.getElementById('introVideo');
  const videoImg = document.getElementById('introFallback');
  const videoToggle = document.getElementById('videoToggle');
  const bubble = document.getElementById('speechBubble');
  let hasVideo = false;

  const useImageFallback = () => {
    hasVideo = false;
    if (video) video.style.display = 'none';
    if (videoImg) videoImg.hidden = false;
    if (videoToggle) videoToggle.style.display = 'none';
    if (bubble) bubble.classList.remove('hidden-bubble');
    video?.closest('.talk-card')?.classList.add('no-video');
  };

  const muteToggle = document.getElementById('muteToggle');
  const syncMuteIcon = () => {
    if (!muteToggle || !video) return;
    muteToggle.textContent = video.muted ? '🔇' : '🔊';
    muteToggle.setAttribute('aria-label', video.muted ? 'Unmute intro video' : 'Mute intro video');
  };
  muteToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!hasVideo || !video) return;
    video.muted = !video.muted;
    if (!video.muted && video.paused) video.play().catch(() => {});
    syncMuteIcon();
  });

  if (video) {
    const src = video.querySelector('source');
    const onSrcError = () => useImageFallback();
    video.addEventListener('error', onSrcError);
    if (src) src.addEventListener('error', onSrcError);
    video.addEventListener('canplay', () => {
      hasVideo = true;
      syncMuteIcon();
      if (bubble) bubble.classList.add('hidden-bubble');
    });
    // If the mp4 404s, some browsers stay silent — double-check shortly after load.
    setTimeout(() => {
      if (video.readyState === 0 && video.networkState === 3) useImageFallback();
    }, 3000);

    videoToggle?.addEventListener('click', () => {
      if (!hasVideo) return;
      if (video.paused) {
        video.muted = false; // user gesture: voiceover becomes audible
        video.play().catch(() => {});
        videoToggle.textContent = '⏸';
        videoToggle.setAttribute('aria-label', 'Pause intro video');
        syncMuteIcon();
      } else {
        video.pause();
        videoToggle.textContent = '▶';
        videoToggle.setAttribute('aria-label', 'Play intro video');
      }
    });
    video.addEventListener('ended', () => {
      if (!videoToggle) return;
      videoToggle.textContent = '▶';
      videoToggle.setAttribute('aria-label', 'Play intro video');
    });
  } else {
    useImageFallback();
  }

  /* ---------- typewriter speech bubble ---------- */
  const tw = document.getElementById('typewriter');
  if (tw && !reduceMotion) {
    const phrases = [
      "Hi, I'm Preet.",
      'I build data platforms.',
      'Healthcare data is my thing.',
      "Let's talk data."
    ];
    let pi = 0, ci = 0, deleting = false;
    (function tick() {
      const phrase = phrases[pi];
      tw.textContent = phrase.slice(0, ci);
      let wait = deleting ? 26 : 58;
      if (!deleting && ci === phrase.length) { wait = 1800; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; wait = 400; }
      else ci += deleting ? -1 : 1;
      setTimeout(tick, wait);
    })();
  } else if (tw) {
    tw.textContent = "Hi, I'm Preet.";
  }

  /* ---------- ID card: pendulum drop + flip ---------- */
  const swing = document.getElementById('idSwing');
  if (swing && !reduceMotion) {
    const swingObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          swing.classList.add('dropped');
          swingObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    swingObserver.observe(swing);
  } else if (swing) {
    swing.style.opacity = '1';
  }

  const idCard = document.querySelector('#idCard');
  if (idCard) {
    const flip = () => idCard.classList.toggle('flipped');
    idCard.addEventListener('click', flip);
    idCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  }

  /* ---------- work accordion panels ---------- */
  const panels = [...document.querySelectorAll('#workPanels .panel')];
  if (panels.length) {
    const openPanel = (target) => panels.forEach(p => p.classList.toggle('open', p === target));
    panels.forEach(panel => {
      if (fineHover) {
        panel.addEventListener('mouseenter', () => openPanel(panel));
      }
      panel.addEventListener('click', (e) => {
        if (panel.classList.contains('open')) return;
        // collapse-first so the clicked panel visibly opens
        openPanel(panel);
        e.preventDefault();
      });
    });
  }

  /* ---------- achievements infinite carousel ---------- */
  const achTrack = document.getElementById('achTrack');
  if (achTrack) {
    // Duplicate the cards so the -50% loop is seamless.
    achTrack.innerHTML += achTrack.innerHTML;
    // Re-observe duplicated reveal cards (they start hidden until intersecting).
    achTrack.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
  }

  /* ---------- periodic table: inspector + family light-up + tilt ---------- */
  const ptable = document.querySelector('#ptable');
  const detail = document.querySelector('#ptableDetail');
  const familyLabels = {
    languages: 'LANGUAGES', platforms: 'PLATFORMS', databases: 'DATABASES',
    bi: 'BI & TOOLS', healthcare: 'HEALTHCARE', core: 'CORE'
  };
  const setDetail = (el) => {
    if (!detail || !el) return;
    detail.querySelector('#pdSym').textContent = el.querySelector('.el-sym').textContent;
    detail.querySelector('#pdName').textContent = el.dataset.name || '';
    detail.querySelector('#pdFamily').textContent = familyLabels[el.dataset.family] || '';
    detail.querySelector('#pdDesc').textContent = el.dataset.desc || '';
  };
  if (ptable) {
    ptable.querySelectorAll('.element').forEach(el => {
      el.addEventListener('mouseenter', () => setDetail(el));
      el.addEventListener('focus', () => setDetail(el));
      el.setAttribute('tabindex', '0');
      if (fineHover && !reduceMotion) {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -12;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
          el.style.transform =
            `translateY(-6px) scale(1.05) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      }
    });
    document.querySelectorAll('#familyFilters .family-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#familyFilters .family-btn').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const fam = btn.dataset.family;
        if (fam === 'all') {
          ptable.classList.remove('dimmed');
          ptable.querySelectorAll('.element').forEach(el => el.classList.remove('lit'));
        } else {
          ptable.classList.add('dimmed');
          ptable.querySelectorAll('.element').forEach(el =>
            el.classList.toggle('lit', el.dataset.family === fam));
          setDetail(ptable.querySelector(`.element[data-family="${fam}"]`));
        }
      });
    });
  }

  /* ---------- parallax + timeline draw (single rAF loop) ---------- */
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  const timelines = [...document.querySelectorAll('.timeline')];
  let ticking = false;

  const updateParallax = () => {
    const vh = window.innerHeight;
    parallaxEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const speed = parseFloat(el.dataset.parallax || '0.1');
      const y = -((r.top + r.height / 2) - vh / 2) * speed;
      const base = el.dataset.parallaxKeep ? 'translate(-50%,-54%) ' : '';
      el.style.transform = `${base}translate3d(0, ${y.toFixed(1)}px, 0)`;
    });
  };

  const updateTimelines = () => {
    const vh = window.innerHeight;
    timelines.forEach(tl => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.82 - r.top) / r.height));
      tl.style.setProperty('--draw', p.toFixed(3));
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateParallax();
      updateTimelines();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

/* ============================================================
   ARTTHA — Editorial Portfolio · Main Application Script
   Dependencies: GSAP + ScrollTrigger (registered), Lenis
   ============================================================ */

(() => {
  'use strict';

  // ── 0. Reduced-motion check ──────────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. GSAP + Lenis Initialization ───────────────────────
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  // Lenis ↔ GSAP bridge
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Fallback RAF loop (keeps Lenis ticking even if GSAP ticker pauses)
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ── 2. Curtain Transition ────────────────────────────────
  function playCurtainTransition(callback) {
    const tl = gsap.timeline();
    const curtainL = document.querySelector('.curtain-left');
    const curtainR = document.querySelector('.curtain-right');

    tl.set('#transition-curtain', { pointerEvents: 'auto' })
      .to(curtainL, { scaleX: 1, duration: 0.5, ease: 'power3.inOut' }, 0)
      .to(curtainR, { scaleX: 1, duration: 0.5, ease: 'power3.inOut' }, 0)
      .call(() => { if (callback) callback(); })
      .to(curtainL, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, '+=0.2')
      .to(curtainR, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, '<')
      .set('#transition-curtain', { pointerEvents: 'none' });

    return tl;
  }

  // ── 3. Navigation ────────────────────────────────────────
  const navPills = document.querySelectorAll('.nav-pill');

  navPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const sectionId = pill.dataset.section;
      const target = document.getElementById(`section-${sectionId}`);
      if (!target) return;

      playCurtainTransition(() => {
        lenis.scrollTo(target, { immediate: true });
      });

      // Update active state immediately for responsiveness
      navPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // ── 4. Section Visibility Tracking ───────────────────────
  function updateActiveNav(sectionId) {
    const shortId = sectionId.replace('section-', '');
    navPills.forEach((pill) => {
      pill.classList.toggle('active', pill.dataset.section === shortId);
    });
  }

  document.querySelectorAll('.section').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => updateActiveNav(section.id),
      onEnterBack: () => updateActiveNav(section.id),
    });
  });

  // ── 5. Hero Parallax (Mouse-driven Multi-plane + 3D Tilt) ──
  const heroSection = document.getElementById('section-home');

  if (heroSection && !prefersReducedMotion) {
    const heroFrame   = document.querySelector('.hero-frame');
    const layerBg     = document.querySelector('.hero-layer-bg');
    const layerText   = document.querySelector('.hero-layer-text');
    const layerFg     = document.querySelector('.hero-layer-fg');
    const heroBadges  = document.querySelectorAll('.hero-meta-badge');
    const heroCoords  = document.querySelector('.hero-telemetry-coords');

    // 3D Card Perspective Tilt
    const tiltX = heroFrame ? gsap.quickTo(heroFrame, 'rotationX', { duration: 0.6, ease: 'power2.out' }) : null;
    const tiltY = heroFrame ? gsap.quickTo(heroFrame, 'rotationY', { duration: 0.6, ease: 'power2.out' }) : null;

    // Multi-plane Depth Translations
    const bgX  = layerBg   ? gsap.quickTo(layerBg,   'x', { duration: 0.7, ease: 'power2.out' }) : null;
    const bgY  = layerBg   ? gsap.quickTo(layerBg,   'y', { duration: 0.7, ease: 'power2.out' }) : null;
    const txtX = layerText ? gsap.quickTo(layerText, 'x', { duration: 0.6, ease: 'power2.out' }) : null;
    const txtY = layerText ? gsap.quickTo(layerText, 'y', { duration: 0.6, ease: 'power2.out' }) : null;
    const fgX  = layerFg   ? gsap.quickTo(layerFg,   'x', { duration: 0.45, ease: 'power2.out' }) : null;
    const fgY  = layerFg   ? gsap.quickTo(layerFg,   'y', { duration: 0.45, ease: 'power2.out' }) : null;
    const bX   = heroBadges.length ? gsap.quickTo(heroBadges, 'x', { duration: 0.55, ease: 'power2.out' }) : null;
    const bY   = heroBadges.length ? gsap.quickTo(heroBadges, 'y', { duration: 0.55, ease: 'power2.out' }) : null;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroFrame ? heroFrame.getBoundingClientRect() : heroSection.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 → 0.5
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;

      // 3D Frame Tilt
      if (tiltY) tiltY(cx * 5);
      if (tiltX) tiltX(-cy * 5);

      // Multi-layer depth translations
      if (bgX)  bgX(-cx * 26);
      if (bgY)  bgY(-cy * 18);
      if (txtX) txtX(cx * 15);
      if (txtY) txtY(cy * 10);
      if (fgX)  fgX(cx * 36);
      if (fgY)  fgY(cy * 24);
      if (bX)   bX(cx * 10);
      if (bY)   bY(cy * 8);

      // Real-time telemetry coordinates
      if (heroCoords) {
        const xPos = String(Math.max(0, Math.round(e.clientX - rect.left))).padStart(4, '0');
        const yPos = String(Math.max(0, Math.round(e.clientY - rect.top))).padStart(4, '0');
        heroCoords.textContent = `X: ${xPos} · Y: ${yPos}`;
      }

      // Spotlight sheen coordinates
      if (heroFrame) {
        heroFrame.style.setProperty('--mouse-x', `${Math.round(e.clientX - rect.left)}px`);
        heroFrame.style.setProperty('--mouse-y', `${Math.round(e.clientY - rect.top)}px`);
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      if (tiltX) tiltX(0);
      if (tiltY) tiltY(0);
      if (bgX)  bgX(0);
      if (bgY)  bgY(0);
      if (txtX) txtX(0);
      if (txtY) txtY(0);
      if (fgX)  fgX(0);
      if (fgY)  fgY(0);
      if (bX)   bX(0);
      if (bY)   bY(0);
      if (heroCoords) {
        heroCoords.textContent = 'STANDBY // 0000 · 0000';
      }
    });

    // Subtle vertical parallax on scroll
    if (layerBg) {
      gsap.to(layerBg, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    if (layerText) {
      gsap.to(layerText, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    if (layerFg) {
      gsap.to(layerFg, {
        yPercent: -22,
        ease: 'none',
        scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  }

  // ── 6. Hero CTA Button (Magnetic Hover + Click) ─────────
  const heroCta = document.querySelector('.hero-cta');

  if (heroCta) {
    heroCta.addEventListener('click', () => {
      const aboutSection = document.getElementById('section-about');
      if (aboutSection) {
        playCurtainTransition(() => {
          lenis.scrollTo(aboutSection, { immediate: true });
        });
      }
    });

    // Magnetic hover effect (preserves translateX(-50%) centering)
    if (!prefersReducedMotion) {
      gsap.set(heroCta, { xPercent: -50 });
      const magnetStrength = 0.35;
      const ctaX = gsap.quickTo(heroCta, 'x', { duration: 0.35, ease: 'power2.out' });
      const ctaY = gsap.quickTo(heroCta, 'y', { duration: 0.35, ease: 'power2.out' });

      heroCta.addEventListener('mousemove', (e) => {
        const rect = heroCta.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top  + rect.height / 2);
        ctaX(relX * magnetStrength);
        ctaY(relY * magnetStrength);
      });

      heroCta.addEventListener('mouseleave', () => {
        ctaX(0);
        ctaY(0);
      });
    }
  }

  // ── 7. Scroll Animations ─────────────────────────────────
  if (!prefersReducedMotion) {
    // — About Section —
    const aboutHeadline = document.querySelector('.about-headline');
    if (aboutHeadline) {
      // Split text into individual characters for reveal
      const text = aboutHeadline.textContent;
      aboutHeadline.innerHTML = '';
      const chars = [];
      [...text].forEach((char) => {
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.style.overflow = 'hidden';
        // Wrap the character inside another span we can animate
        const inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.textContent = char === ' ' ? '\u00A0' : char;
        span.appendChild(inner);
        aboutHeadline.appendChild(span);
        chars.push(inner);
      });

      gsap.from(chars, {
        yPercent: 120,
        opacity: 0,
        duration: 0.8,
        ease: 'power4.out',
        stagger: 0.025,
        scrollTrigger: {
          trigger: aboutHeadline,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    gsap.utils.toArray('.about-bio p').forEach((p, i) => {
      gsap.from(p, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        delay: i * 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: p,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    const aboutStamp = document.querySelector('.about-stamp');
    if (aboutStamp) {
      gsap.from(aboutStamp, {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: aboutStamp,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    gsap.utils.toArray('.discipline-table tr').forEach((row, i) => {
      gsap.from(row, {
        x: 60,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      });
    });

    const aboutDivider = document.querySelector('.about-divider');
    if (aboutDivider) {
      gsap.from(aboutDivider, {
        height: 0,
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: aboutDivider,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    // — Photos Section —
    gsap.utils.toArray('#section-photos .section-title').forEach((title) => {
      gsap.from(title, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    const filmFrames = gsap.utils.toArray('.film-frame');
    filmFrames.forEach((frame, i) => {
      gsap.from(frame, {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: frame,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    });

    // — Setup Section —
    const setupBlueprint = document.querySelector('.setup-blueprint');
    if (setupBlueprint) {
      gsap.from(setupBlueprint, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: setupBlueprint,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      gsap.utils.toArray('.hotspot').forEach((hotspot, i) => {
        gsap.from(hotspot, {
          opacity: 0,
          scale: 0,
          duration: 0.5,
          delay: 0.6 + i * 0.3, // after blueprint appears
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: setupBlueprint,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
      });
    }

    // — Cycling Section —
    const routePath = document.querySelector('.route-path');
    if (routePath) {
      const pathLength = routePath.getTotalLength();
      gsap.set(routePath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
      gsap.to(routePath, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: routePath.closest('.section') || routePath,
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 1,
        },
      });
    }

    gsap.utils.toArray('.route-marker').forEach((marker) => {
      gsap.from(marker, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: marker,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // — Poem Section —
    const poemTitle = document.querySelector('.poem-title');
    if (poemTitle) {
      gsap.from(poemTitle, {
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: poemTitle,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    gsap.utils.toArray('.stanza').forEach((stanza, i) => {
      gsap.from(stanza, {
        opacity: 0,
        x: -20,
        duration: 0.6,
        delay: i * 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: stanza,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    // — Footer / Colophon —
    gsap.utils.toArray('.colophon-block').forEach((block, i) => {
      gsap.from(block, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: i * 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: block,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  // ── 8. Photo Lightbox ────────────────────────────────────
  const lightbox      = document.querySelector('.lightbox');
  const lightboxImg   = document.querySelector('.lightbox-image');
  const lightboxLoupe = document.querySelector('.lightbox-loupe');
  const frames        = document.querySelectorAll('.film-frame');
  let currentFrameIndex = 0;

  function openLightbox(index) {
    if (!lightbox || !lightboxImg) return;
    currentFrameIndex = index;
    const img = frames[index].querySelector('.frame-image img');
    if (!img) return;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;

    // Update metadata
    const frameNumEl = document.querySelector('.lightbox-frame-num');
    const exifEl     = document.querySelector('.lightbox-exif');
    if (frameNumEl) frameNumEl.textContent = frames[index].dataset.frame || '';
    if (exifEl) {
      const srcExif = frames[index].querySelector('.frame-exif');
      exifEl.textContent = srcExif ? srcExif.textContent : '';
    }

    lightbox.hidden = false;
    // Force reflow before adding class so transition fires
    lightbox.offsetHeight; // eslint-disable-line no-unused-expressions
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lenis.stop();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    setTimeout(() => { lightbox.hidden = true; }, 400);
    document.body.style.overflow = '';
    lenis.start();
  }

  function navigateLightbox(direction) {
    if (!frames.length) return;
    currentFrameIndex = (currentFrameIndex + direction + frames.length) % frames.length;
    const img = frames[currentFrameIndex].querySelector('.frame-image img');
    if (!img || !lightboxImg) return;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;

    const frameNumEl = document.querySelector('.lightbox-frame-num');
    const exifEl     = document.querySelector('.lightbox-exif');
    if (frameNumEl) frameNumEl.textContent = frames[currentFrameIndex].dataset.frame || '';
    if (exifEl) {
      const srcExif = frames[currentFrameIndex].querySelector('.frame-exif');
      exifEl.textContent = srcExif ? srcExif.textContent : '';
    }
  }

  // Open on frame click / keyboard
  frames.forEach((frame, index) => {
    frame.addEventListener('click', () => openLightbox(index));
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  // Close button
  const lightboxCloseBtn = document.querySelector('.lightbox-close');
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);

  // Close on background click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Prev / Next buttons
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));

  // ── 9. Loupe Magnifier ───────────────────────────────────
  if (lightboxImg && lightboxLoupe) {
    lightboxImg.addEventListener('mousemove', (e) => {
      const rect = lightboxImg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;

      lightboxLoupe.style.display = 'block';
      lightboxLoupe.style.left    = `${e.clientX - 75}px`;
      lightboxLoupe.style.top     = `${e.clientY - 75}px`;
      lightboxLoupe.style.backgroundImage    = `url(${lightboxImg.src})`;
      lightboxLoupe.style.backgroundPosition = `${percentX}% ${percentY}%`;
    });

    lightboxImg.addEventListener('mouseleave', () => {
      lightboxLoupe.style.display = 'none';
    });
  }

  // ── 10. Dotfiles Drawer (Setup Section) ──────────────────
  const drawer       = document.querySelector('.dotfiles-drawer');
  const dotfilesEl   = document.getElementById('dotfiles-data');
  let dotfilesData   = {};

  if (dotfilesEl) {
    try { dotfilesData = JSON.parse(dotfilesEl.textContent); }
    catch (_) { /* graceful fallback */ }
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    setTimeout(() => { drawer.hidden = true; }, 500);
    lenis.start();
  }

  document.querySelectorAll('.hotspot').forEach((hotspot) => {
    hotspot.addEventListener('click', () => {
      if (!drawer) return;
      const component = hotspot.dataset.component;
      const data = dotfilesData[component];
      if (!data) return;

      const titleEl = drawer.querySelector('.drawer-title');
      const specsEl = drawer.querySelector('.drawer-specs');
      const codeEl  = drawer.querySelector('.drawer-code code');
      if (titleEl) titleEl.textContent = data.title;
      if (specsEl) specsEl.textContent = data.specs;
      if (codeEl)  codeEl.textContent  = data.code;

      drawer.hidden = false;
      requestAnimationFrame(() => drawer.classList.add('open'));
      lenis.stop();
    });
  });

  if (drawer) {
    const drawerCloseBtn = drawer.querySelector('.drawer-close');
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);

    // Copy button
    const copyBtn = drawer.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const codeEl = drawer.querySelector('.drawer-code code');
        if (!codeEl) return;
        navigator.clipboard.writeText(codeEl.textContent).then(() => {
          const toast = drawer.querySelector('.copy-toast');
          if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
          }
        });
      });
    }
  }

  // ── 11. Poem Switcher ────────────────────────────────────
  document.querySelectorAll('.toc-item').forEach((item) => {
    item.addEventListener('click', () => {
      const poemId = item.dataset.poem;

      // Update active TOC item
      document.querySelectorAll('.toc-item').forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      // Cross-fade poem content
      document.querySelectorAll('.poem-content').forEach((content) => {
        content.classList.add('hidden');
      });

      const target = document.querySelector(`[data-poem-id="${poemId}"]`);
      if (!target) return;
      target.classList.remove('hidden');

      // Animate stanzas in
      gsap.fromTo(
        target.querySelectorAll('.stanza'),
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }
      );
    });
  });

  // ── 12. Paper & Rain Ambience (Web Audio API) ────────────
  let ambienceCtx    = null;
  let ambienceNodes  = null;
  let ambienceActive = false;

  function createAmbience() {
    ambienceCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Brown noise buffer
    const bufferSize  = 2 * ambienceCtx.sampleRate;
    const noiseBuffer = ambienceCtx.createBuffer(1, bufferSize, ambienceCtx.sampleRate);
    const output      = noiseBuffer.getChannelData(0);
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noiseSource = ambienceCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop   = true;

    // Low-pass filter for rain texture
    const filter = ambienceCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gainNode = ambienceCtx.createGain();
    gainNode.gain.value = 0;

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ambienceCtx.destination);
    noiseSource.start();

    return { source: noiseSource, gain: gainNode, filter };
  }

  const ambienceToggle = document.querySelector('.ambience-toggle');
  if (ambienceToggle) {
    ambienceToggle.addEventListener('click', function () {
      if (!ambienceActive) {
        if (!ambienceNodes) ambienceNodes = createAmbience();
        ambienceNodes.gain.gain.linearRampToValueAtTime(0.15, ambienceCtx.currentTime + 1);
        this.setAttribute('aria-pressed', 'true');
        ambienceActive = true;
      } else {
        ambienceNodes.gain.gain.linearRampToValueAtTime(0, ambienceCtx.currentTime + 1);
        this.setAttribute('aria-pressed', 'false');
        ambienceActive = false;
      }
    });
  }

  // ── 13. Quote Card Generator ─────────────────────────────
  const quoteCardBtn = document.querySelector('.quote-card-btn');
  if (quoteCardBtn) {
    quoteCardBtn.addEventListener('click', () => {
      const activePoemContent = document.querySelector('.poem-content:not(.hidden)');
      if (!activePoemContent) return;

      const title       = activePoemContent.querySelector('.poem-title')?.textContent || 'poem';
      const stanzaEl    = activePoemContent.querySelector('.stanza p');
      if (!stanzaEl) return;
      const firstStanza = stanzaEl.innerHTML.replace(/<br\s*\/?>/g, '\n');

      // Create 1080×1080 canvas
      const canvas = document.createElement('canvas');
      canvas.width  = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      // Background: canvas cream
      ctx.fillStyle = '#F4EFE6';
      ctx.fillRect(0, 0, 1080, 1080);

      // Accent border
      ctx.strokeStyle = '#5E1224';
      ctx.lineWidth   = 2;
      ctx.strokeRect(60, 60, 960, 960);

      // Title
      ctx.fillStyle = '#5E1224';
      ctx.font      = 'italic 42px "Cormorant Garamond", serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, 540, 200);

      // Stanza lines
      ctx.fillStyle = '#1A1415';
      ctx.font      = '28px "Newsreader", serif';
      const lines   = firstStanza.split('\n');
      let y = 340;
      lines.forEach((line) => {
        ctx.fillText(line.trim(), 540, y);
        y += 52;
      });

      // Attribution watermark
      ctx.fillStyle = '#5E1224';
      ctx.font      = '18px "JetBrains Mono", monospace';
      ctx.fillText('ARTTHA', 540, 900);

      // Trigger download
      const link   = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-quote.png`;
      link.href     = canvas.toDataURL('image/png');
      link.click();
    });
  }

  // ── 14. Wax Seal Stamp ───────────────────────────────────
  const waxSeal = document.querySelector('.wax-seal');
  if (waxSeal) {
    let sealed = false;
    waxSeal.addEventListener('click', () => {
      if (sealed) return;
      sealed = true;

      gsap.timeline()
        .to(waxSeal, { scale: 1.2, duration: 0.15, ease: 'power2.out' })
        .to(waxSeal, { scale: 0.92, duration: 0.3, ease: 'bounce.out' })
        .call(() => {
          waxSeal.classList.add('stamped');
          const sealText = document.querySelector('.seal-text');
          if (sealText) sealText.textContent = 'Tersegel.';
        });
    });
  }

  // ── 15. Contact Copy Links ───────────────────────────────
  document.querySelectorAll('.contact-link').forEach((link) => {
    link.addEventListener('click', () => {
      const text = link.dataset.copy;
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.querySelector('.contact-toast');
        if (toast) {
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2000);
        }
      });
    });
  });

  // ── 16. Elevation Profile Scrubber ───────────────────────
  const elevationSvg  = document.querySelector('.elevation-svg');
  const elevationPath = document.querySelector('.elevation-path');
  const scrubber      = document.querySelector('.elevation-scrubber');

  if (elevationSvg && elevationPath && scrubber) {
    elevationSvg.addEventListener('mousemove', (e) => {
      const svgPoint = elevationSvg.createSVGPoint();
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
      const transformed = svgPoint.matrixTransform(elevationSvg.getScreenCTM().inverse());

      const pathLength = elevationPath.getTotalLength();
      // Find the point on path closest to the cursor's x position
      let closest     = 0;
      let closestDist = Infinity;
      for (let i = 0; i <= pathLength; i += 2) {
        const pt   = elevationPath.getPointAtLength(i);
        const dist = Math.abs(pt.x - transformed.x);
        if (dist < closestDist) {
          closestDist = dist;
          closest     = i;
        }
      }
      const point = elevationPath.getPointAtLength(closest);
      scrubber.setAttribute('cx', point.x);
      scrubber.setAttribute('cy', point.y);
    });
  }

  // ── 17. Global Keyboard Handler ──────────────────────────
  document.addEventListener('keydown', (e) => {
    // Lightbox keyboard controls
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'ArrowLeft')  navigateLightbox(-1);
      return; // consume event while lightbox is open
    }

    // Drawer keyboard controls
    if (drawer && drawer.classList.contains('open')) {
      if (e.key === 'Escape') closeDrawer();
    }
  });

})();

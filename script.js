/* =================================================================
   THE WAVE TALK — common site script (shared across all pages)
   - Injects common header / footer (single source of truth)
   - Mobile nav, sticky header, reveal-on-scroll, counters, form, year
   ================================================================= */
(function () {
  'use strict';

  /* ---------- shared chrome (header / footer) ---------- */
  var NAV = [
    { href: 'company.html',     label: '회사소개',  key: 'company' },
    { href: 'technology.html',  label: '핵심기술',  key: 'technology' },
    { href: 'solution.html',    label: '솔루션',    key: 'solution' },
    { href: 'product.html',     label: '제품',      key: 'product' },
    { href: 'application.html', label: '적용분야',  key: 'application' },
    { href: 'news.html',        label: '뉴스',      key: 'news' }
  ];

  var page = document.body.getAttribute('data-page') || 'index';

  var LOGO_SVG =
    '<svg viewBox="0 0 32 32" width="28" height="28"><path d="M2 18c3.5 0 3.5-6 7-6s3.5 6 7 6 3.5-6 7-6 3.5 6 7 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M2 24c3.5 0 3.5-6 7-6s3.5 6 7 6 3.5-6 7-6 3.5 6 7 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".5"/></svg>';

  function navLinks() {
    return NAV.map(function (n) {
      var active = n.key === page ? ' active' : '';
      return '<a href="' + n.href + '" class="nav-link' + active + '">' + n.label + '</a>';
    }).join('');
  }

  var headerHTML =
    '<header class="site-header" id="header">' +
      '<div class="container header-inner">' +
        '<a href="index.html" class="brand" aria-label="THE WAVE TALK 홈">' +
          '<img src="assets/images/logo-white.png" class="brand-logo brand-logo--on-dark" alt="THE WAVE TALK">' +
          '<img src="assets/images/logo.png" class="brand-logo brand-logo--on-light" alt="" aria-hidden="true">' +
        '</a>' +
        '<nav class="nav" id="nav" aria-label="주요 메뉴">' +
          navLinks() +
          '<a href="contact.html" class="nav-cta' + (page === 'contact' ? ' active' : '') + '">도입 문의</a>' +
        '</nav>' +
        '<button class="nav-toggle" id="navToggle" aria-label="메뉴 열기" aria-expanded="false">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>' +
    '</header>';

  var footerHTML =
    '<footer class="site-footer">' +
      '<div class="container footer-inner">' +
        '<div class="footer-brand">' +
          '<span class="footer-logo"><img src="assets/images/logo-white.png" class="footer-brand-logo" alt="THE WAVE TALK"></span>' +
          '<p>레이저와 AI로 물속을 측정하는 수질·미생물 측정 기술 기업.</p>' +
          '<p class="footer-contact">대전 서구 둔산로137번길 21, 8층 (대승빌딩)<br>' +
          '<a href="mailto:thewavetalk@thewavetalk.com">thewavetalk@thewavetalk.com</a>' +
          '<span class="footer-sep">·</span><a href="tel:+82234092477">+82-2-3409-2477</a></p>' +
        '</div>' +
        '<nav class="footer-nav" aria-label="푸터 메뉴">' +
          '<a href="company.html">회사소개</a>' +
          '<a href="technology.html">핵심기술</a>' +
          '<a href="solution.html">솔루션</a>' +
          '<a href="product.html">제품</a>' +
          '<a href="application.html">적용분야</a>' +
          '<a href="news.html">뉴스</a>' +
          '<a href="contact.html">문의</a>' +
        '</nav>' +
        '<p class="footer-copy">© <span id="year"></span> THE WAVE TALK. All rights reserved.</p>' +
      '</div>' +
    '</footer>';

  var hdr = document.getElementById('site-header');
  if (hdr) hdr.outerHTML = headerHTML;
  var ftr = document.getElementById('site-footer');
  if (ftr) ftr.outerHTML = footerHTML;

  /* ---------- references (after injection) ---------- */
  var header = document.getElementById('header');
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');

  /* ---------- sticky header on scroll ---------- */
  var onScroll = function () {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  var closeNav = function () {
    nav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };
  navToggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(
    '.section-head, .about-top, .strengths li, .problem-intro, .issue, .tech-featured, .tech-card,' +
    '.process-step, .solution-row, .product-featured, .product-card, .product-note, .app-card,' +
    '.perf-metrics, .trust-card, .partners, .contact-intro, .contact-form, .sum-block, .news-item, .timeline-item'
  );
  revealEls.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
  });
  var revealObs = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(function (el) { revealObs.observe(el); });

  /* ---------- counters ---------- */
  var animateCount = function (el) {
    var target = parseFloat(el.dataset.target);
    var plain = el.dataset.plain === 'true';
    var duration = 1400, start = performance.now();
    var tick = function (now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = plain ? String(val) : val.toLocaleString('ko-KR');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = plain ? String(target) : target.toLocaleString('ko-KR');
    };
    requestAnimationFrame(tick);
  };
  var counterObs = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.count').forEach(animateCount);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-counters]').forEach(function (g) { counterObs.observe(g); });

  /* ---------- contact form (demo handler) ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var note = document.getElementById('formNote');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk || !message) {
        note.textContent = '이름, 올바른 이메일, 문의 내용을 입력해 주세요.';
        note.className = 'form-note err';
        return;
      }
      note.textContent = '문의가 접수되었습니다. 담당자가 곧 연락드리겠습니다.';
      note.className = 'form-note ok';
      form.reset();
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

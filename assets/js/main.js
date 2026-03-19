/* ========================================
   main.js — brent1980
   ======================================== */

(function () {
  'use strict';

  // ─── Mobile Nav ─────────────────────
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      navToggle.classList.toggle('open');
    });
    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });
  }

  // ─── Scroll Reveal ──────────────────
  var els = document.querySelectorAll('.reveal');

  if (els.length && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('shown');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

    els.forEach(function (el) { obs.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('shown'); });
  }

  // ─── FAQ Accordion ──────────────────
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (f) {
        f.classList.remove('open');
      });
      if (!isOpen) item.classList.add('open');
    });
  });

  // ─── Profile rows appear on load ────
  var rows = document.querySelectorAll('.profile-row');
  rows.forEach(function (row, i) {
    setTimeout(function () { row.classList.add('show'); }, 80 + i * 100);
  });

})();

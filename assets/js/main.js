/* ========================================
   main.js — System Log Theme
   ======================================== */

(function () {
  'use strict';

  var html = document.documentElement;

  // ─── Mode (dark / darker) ───────────
  var mode = localStorage.getItem('sysmode') || 'dark';
  html.setAttribute('data-mode', mode);

  function toggleMode() {
    mode = mode === 'dark' ? 'darker' : 'dark';
    html.setAttribute('data-mode', mode);
    localStorage.setItem('sysmode', mode);
  }

  var modeBtn = document.getElementById('modeToggle');
  if (modeBtn) {
    modeBtn.addEventListener('click', toggleMode);
  }

  // ─── Keyboard Shortcuts ─────────────
  var keyHints = document.getElementById('key-hints');
  var hintTimer;

  document.addEventListener('keydown', function (e) {
    var tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    var key = e.key.toLowerCase();

    if (key === 'd') {
      toggleMode();
    }

    if (key === 'l') {
      if (keyHints) {
        var showing = keyHints.classList.toggle('show');
        clearTimeout(hintTimer);
        if (showing) {
          hintTimer = setTimeout(function () {
            keyHints.classList.remove('show');
          }, 5000);
        }
      }
    }

    if (key === 'escape') {
      if (keyHints) keyHints.classList.remove('show');
    }
  });

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
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if ('IntersectionObserver' in window) {
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
  }

  // ─── FAQ ────────────────────────────
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

  // ─── Boot Animation ─────────────────
  var bootOverlay = document.getElementById('boot-overlay');

  if (bootOverlay) {
    var alreadyBooted = sessionStorage.getItem('sys_booted');
    if (alreadyBooted) {
      bootOverlay.style.display = 'none';
      startHeroProfile();
      initScrollReveal();
    } else {
      runBoot(bootOverlay);
    }
  } else {
    startHeroProfile();
    initScrollReveal();
  }

  function runBoot(overlay) {
    var lines = overlay.querySelectorAll('.boot-line');
    var delay = 180;
    var step = 320;

    lines.forEach(function (line, i) {
      var t = delay + i * step + (Math.random() * 80 - 40);
      setTimeout(function () { line.classList.add('show'); }, t);
    });

    var total = delay + lines.length * step + 600;

    setTimeout(function () {
      overlay.classList.add('fade-out');
      setTimeout(function () {
        overlay.style.display = 'none';
        sessionStorage.setItem('sys_booted', '1');
        startHeroProfile();
        initScrollReveal();
      }, 900);
    }, total);
  }

  // ─── Hero Profile Animation ─────────
  function startHeroProfile() {
    var rows = document.querySelectorAll('.profile-row');
    rows.forEach(function (row, i) {
      setTimeout(function () {
        row.classList.add('show');
      }, 80 + i * 110);
    });

    // Typing effect for hero command
    var heroCmd = document.getElementById('heroCmd');
    if (heroCmd) {
      var text = 'whoami';
      var idx = 0;
      var startDelay = rows.length ? rows.length * 110 + 200 : 200;
      setTimeout(function () {
        var t = setInterval(function () {
          if (idx < text.length) {
            heroCmd.textContent += text[idx];
            idx++;
          } else {
            clearInterval(t);
          }
        }, 90);
      }, startDelay);
    }
  }

})();

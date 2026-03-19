/* ========================================
   works.js — System Log Theme
   ======================================== */

var worksData = [];

var categoryLabels = {
  web:        'web.system',
  tools:      'internal.tool',
  automation: 'automation'
};

function fetchWorks() {
  return fetch('data/works.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      worksData = data;
      return data;
    });
}

function escapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function createRecordItem(work) {
  var tagsHtml = work.tags.map(function (tag) {
    return '<span class="record-tag">' + escapeHtml(tag) + '</span>';
  }).join('');

  var year = work.year || (work.date ? work.date.substring(0, 4) : '—');
  var cat  = categoryLabels[work.category] || work.category;

  return (
    '<div class="record-item reveal" data-category="' + escapeHtml(work.category) + '">' +
      '<div class="record-header">' +
        '<span class="record-year">' + escapeHtml(year) + '</span>' +
        '<span class="record-category">' + escapeHtml(cat) + '</span>' +
      '</div>' +
      '<div class="record-title-line">' +
        '<span class="record-prompt">&gt;</span>' +
        '<span class="record-title">' + escapeHtml(work.title) + '</span>' +
      '</div>' +
      '<p class="record-summary">' + escapeHtml(work.summary) + '</p>' +
      '<div class="record-meta">' +
        '<div class="record-meta-row">' +
          '<span class="record-meta-key">status</span>' +
          '<span class="record-meta-val">: deployed</span>' +
        '</div>' +
      '</div>' +
      '<div class="record-tags">' + tagsHtml + '</div>' +
      '<a href="work.html?id=' + encodeURIComponent(work.id) + '" class="record-link">→ view record</a>' +
    '</div>'
  );
}

function loadFeaturedWorks() {
  var container = document.getElementById('featuredWorks');
  if (!container) return;

  fetchWorks().then(function (data) {
    var featured = data
      .filter(function (w) { return w.featured && w.visible !== false; })
      .sort(function (a, b) {
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) return a.sortOrder - b.sortOrder;
        return b.date.localeCompare(a.date);
      })
      .slice(0, 4);

    container.innerHTML = '<div class="record-list">' + featured.map(createRecordItem).join('') + '</div>';
    initReveal(container);
  });
}

function loadAllWorks() {
  var container  = document.getElementById('worksGrid');
  var noResults  = document.getElementById('noResults');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var searchInput = document.getElementById('searchInput');

  if (!container) return;

  var currentFilter = 'all';
  var currentSearch = '';

  fetchWorks().then(function () {
    renderWorks();
    setupFilter();
    setupSearch();
  });

  function renderWorks() {
    var filtered = worksData.filter(function (w) {
      if (w.visible === false) return false;
      var matchCat = currentFilter === 'all' || w.category === currentFilter;
      var matchQ = true;
      if (currentSearch) {
        var q = currentSearch.toLowerCase();
        matchQ =
          w.title.toLowerCase().indexOf(q) !== -1 ||
          w.summary.toLowerCase().indexOf(q) !== -1 ||
          w.tags.some(function (t) { return t.toLowerCase().indexOf(q) !== -1; }) ||
          (categoryLabels[w.category] || '').indexOf(q) !== -1;
      }
      return matchCat && matchQ;
    });

    filtered.sort(function (a, b) {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) return a.sortOrder - b.sortOrder;
      return b.date.localeCompare(a.date);
    });

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
    } else {
      container.innerHTML = filtered.map(createRecordItem).join('');
      if (noResults) noResults.style.display = 'none';
      initReveal(container);
    }
  }

  function setupFilter() {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter');
        renderWorks();
      });
    });
  }

  function setupSearch() {
    if (!searchInput) return;
    searchInput.addEventListener('input', function () {
      currentSearch = this.value.trim();
      renderWorks();
    });
  }
}

function loadWorkDetail() {
  var container = document.getElementById('workDetail');
  if (!container) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');

  if (!id) {
    container.innerHTML = '<div class="section"><div class="container"><p style="font-family:var(--mono);color:var(--text-dim);">No project ID. <a href="works.html">← project.log</a></p></div></div>';
    return;
  }

  fetchWorks().then(function (data) {
    var work = data.find(function (w) { return w.id === id; });

    if (!work) {
      container.innerHTML = '<div class="section"><div class="container"><p style="font-family:var(--mono);color:var(--text-dim);">Project not found. <a href="works.html">← project.log</a></p></div></div>';
      return;
    }

    document.title = work.title + ' — brent1980';
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', work.summary);

    var sorted = data.slice().sort(function (a, b) {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) return a.sortOrder - b.sortOrder;
      return b.date.localeCompare(a.date);
    });
    var idx = sorted.findIndex(function (w) { return w.id === id; });
    var prevWork = idx < sorted.length - 1 ? sorted[idx + 1] : null;
    var nextWork = idx > 0 ? sorted[idx - 1] : null;

    var galleryHtml = '';
    if (work.images && work.images.length) {
      galleryHtml = '<div class="work-gallery">' +
        work.images.map(function (img) {
          return '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(work.title) + '" onerror="this.style.display=\'none\'">';
        }).join('') +
        '</div>';
    }

    var tagsHtml = work.tags.map(function (t) {
      return '<span class="record-tag">' + escapeHtml(t) + '</span>';
    }).join('');

    var year = work.year || (work.date ? work.date.substring(0, 4) : '—');
    var cat  = categoryLabels[work.category] || work.category;

    var navHtml = '<div class="work-nav">';
    navHtml += prevWork
      ? '<a href="work.html?id=' + encodeURIComponent(prevWork.id) + '">← ' + escapeHtml(prevWork.title) + '</a>'
      : '<span></span>';
    navHtml += nextWork
      ? '<a href="work.html?id=' + encodeURIComponent(nextWork.id) + '">' + escapeHtml(nextWork.title) + ' →</a>'
      : '<span></span>';
    navHtml += '</div>';

    container.innerHTML =
      '<div class="work-detail-head">' +
        '<div class="container">' +
          '<a href="works.html" class="back-link">← project.log</a>' +
          '<div class="work-detail-meta">' +
            '<span class="record-year">' + escapeHtml(year) + '</span>' +
            '<span class="record-category">' + escapeHtml(cat) + '</span>' +
          '</div>' +
          '<h1 class="work-detail-title">' + escapeHtml(work.title) + '</h1>' +
          '<p class="work-detail-summary">' + escapeHtml(work.summary) + '</p>' +
          '<div class="work-detail-tags">' + tagsHtml + '</div>' +
        '</div>' +
      '</div>' +
      '<section class="section">' +
        '<div class="container">' +
          '<div class="work-detail-body">' +
            '<div>' +
              galleryHtml +
              '<div class="work-detail-content">' + work.content + '</div>' +
              navHtml +
            '</div>' +
            '<aside class="work-sidebar">' +
              '<div class="sidebar-section">' +
                '<div class="sidebar-label">// status</div>' +
                '<div class="sidebar-val" style="color:var(--green);">● deployed</div>' +
              '</div>' +
              '<div class="sidebar-section">' +
                '<div class="sidebar-label">// year</div>' +
                '<div class="sidebar-val">' + escapeHtml(year) + '</div>' +
              '</div>' +
              '<div class="sidebar-section">' +
                '<div class="sidebar-label">// type</div>' +
                '<div class="sidebar-val">' + escapeHtml(cat) + '</div>' +
              '</div>' +
              '<div class="sidebar-section">' +
                '<div class="sidebar-label">// tech</div>' +
                '<div class="work-detail-tags" style="margin-top:10px;gap:5px;flex-wrap:wrap;display:flex;">' + tagsHtml + '</div>' +
              '</div>' +
            '</aside>' +
          '</div>' +
        '</div>' +
      '</section>';
  });
}

function initReveal(container) {
  var els = container
    ? container.querySelectorAll('.reveal:not(.shown)')
    : document.querySelectorAll('.reveal:not(.shown)');

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('shown');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -16px 0px' });

    els.forEach(function (el) { obs.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('shown'); });
  }
}

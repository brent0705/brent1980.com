/* ========================================
   works.js - Brent1980.com
   Load works from JSON, filter, search, detail page
   ======================================== */

var worksData = [];

var categoryLabels = {
  web: 'Web 系統',
  tools: '內部工具',
  automation: '自動化/整合'
};

/**
 * Fetch works.json
 */
function fetchWorks() {
  return fetch('data/works.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      worksData = data;
      return data;
    });
}

/**
 * Create a work card HTML string
 */
function createWorkCard(work) {
  var tagsHtml = work.tags.map(function (tag) {
    return '<span class="tag">' + escapeHtml(tag) + '</span>';
  }).join('');

  var linksHtml = '';
  if (work.links.demo) {
    linksHtml += '<a href="' + escapeHtml(work.links.demo) + '" class="btn btn-sm btn-outline" target="_blank" rel="noopener noreferrer">Demo</a>';
  }


  return '<div class="work-card fade-in visible" data-category="' + escapeHtml(work.category) + '">' +
    '<img src="' + escapeHtml(work.cover) + '" alt="' + escapeHtml(work.title) + '" class="work-card-cover" onerror="this.style.background=\'var(--color-bg-alt)\';this.alt=\'\';">' +
    '<div class="work-card-body">' +
      '<span class="work-card-category">' + escapeHtml(categoryLabels[work.category] || work.category) + '</span>' +
      '<h3 class="work-card-title">' + escapeHtml(work.title) + '</h3>' +
      '<p class="work-card-summary">' + escapeHtml(work.summary) + '</p>' +
      '<div class="work-card-tags">' + tagsHtml + '</div>' +
      '<div class="work-card-footer">' +
        '<span class="work-card-date">' + escapeHtml(work.date) + '</span>' +
        '<div class="work-card-links">' +
          '<a href="work.html?id=' + encodeURIComponent(work.id) + '" class="btn btn-sm btn-primary">查看詳細</a>' +
          linksHtml +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/**
 * Load featured works on homepage
 */
function loadFeaturedWorks() {
  var container = document.getElementById('featuredWorks');
  if (!container) return;

  fetchWorks().then(function (data) {
    var featured = data
      .filter(function (w) { return w.featured; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); })
      .slice(0, 6);

    container.innerHTML = featured.map(createWorkCard).join('');
  });
}

/**
 * Load all works on works.html with filter & search
 */
function loadAllWorks() {
  var container = document.getElementById('worksGrid');
  var noResults = document.getElementById('noResults');
  var filterButtons = document.querySelectorAll('.filter-btn');
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
      var matchCategory = currentFilter === 'all' || w.category === currentFilter;
      var matchSearch = true;
      if (currentSearch) {
        var q = currentSearch.toLowerCase();
        matchSearch =
          w.title.toLowerCase().indexOf(q) !== -1 ||
          w.summary.toLowerCase().indexOf(q) !== -1 ||
          w.tags.some(function (t) { return t.toLowerCase().indexOf(q) !== -1; }) ||
          (categoryLabels[w.category] || '').indexOf(q) !== -1;
      }
      return matchCategory && matchSearch;
    });

    filtered.sort(function (a, b) { return b.date.localeCompare(a.date); });

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
    } else {
      container.innerHTML = filtered.map(createWorkCard).join('');
      if (noResults) noResults.style.display = 'none';
    }
  }

  function setupFilter() {
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterButtons.forEach(function (b) { b.classList.remove('active'); });
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

/**
 * Load work detail on work.html?id=xxx
 */
function loadWorkDetail() {
  var container = document.getElementById('workDetail');
  if (!container) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');

  if (!id) {
    container.innerHTML = '<div class="section"><div class="container"><p>未指定專案 ID。<a href="works.html">回到專案列表</a></p></div></div>';
    return;
  }

  fetchWorks().then(function (data) {
    var work = data.find(function (w) { return w.id === id; });

    if (!work) {
      container.innerHTML = '<div class="section"><div class="container"><p>找不到此專案。<a href="works.html">回到專案列表</a></p></div></div>';
      return;
    }

    // Update page title and meta
    document.title = work.title + ' - Brent1980';
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', work.summary);

    // Find prev/next
    var sortedWorks = data.sort(function (a, b) { return b.date.localeCompare(a.date); });
    var currentIndex = sortedWorks.findIndex(function (w) { return w.id === id; });
    var prevWork = currentIndex < sortedWorks.length - 1 ? sortedWorks[currentIndex + 1] : null;
    var nextWork = currentIndex > 0 ? sortedWorks[currentIndex - 1] : null;

    // Build gallery
    var galleryHtml = '';
    if (work.images && work.images.length > 0) {
      galleryHtml = '<div class="work-detail-gallery">' +
        work.images.map(function (img) {
          return '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(work.title) + '" onerror="this.style.background=\'var(--color-bg-alt)\';this.style.minHeight=\'200px\';this.alt=\'\';">';
        }).join('') +
      '</div>';
    }

    // Build tags
    var tagsHtml = work.tags.map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    // Build links
    var linksHtml = '';
    if (work.links.demo || work.links.repo || work.links.download) {
      linksHtml = '<div class="work-detail-links">';
      if (work.links.demo) {
        linksHtml += '<a href="' + escapeHtml(work.links.demo) + '" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Demo</a>';
      }

      if (work.links.download) {
        linksHtml += '<a href="' + escapeHtml(work.links.download) + '" class="btn btn-outline" target="_blank" rel="noopener noreferrer">下載</a>';
      }
      linksHtml += '</div>';
    }

    // Build prev/next nav
    var navHtml = '<div class="work-nav">';
    if (prevWork) {
      navHtml += '<a href="work.html?id=' + encodeURIComponent(prevWork.id) + '">&larr; ' + escapeHtml(prevWork.title) + '</a>';
    } else {
      navHtml += '<span></span>';
    }
    if (nextWork) {
      navHtml += '<a href="work.html?id=' + encodeURIComponent(nextWork.id) + '">' + escapeHtml(nextWork.title) + ' &rarr;</a>';
    } else {
      navHtml += '<span></span>';
    }
    navHtml += '</div>';

    // Render
    container.innerHTML =
      '<section class="work-detail-header" style="background-color: var(--color-bg-alt); border-bottom: 1px solid var(--color-border);">' +
        '<div class="container">' +
          '<span class="work-card-category">' + escapeHtml(categoryLabels[work.category] || work.category) + '</span>' +
          '<h1 class="work-detail-title">' + escapeHtml(work.title) + '</h1>' +
          '<p class="work-detail-summary">' + escapeHtml(work.summary) + '</p>' +
          '<div class="work-detail-meta">' +
            '<span class="work-card-date">' + escapeHtml(work.date) + '</span>' +
            '<div class="work-card-tags">' + tagsHtml + '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="section">' +
        '<div class="container">' +
          galleryHtml +
          '<div class="work-detail-content">' +
            work.content +
          '</div>' +
          linksHtml +
          navHtml +
        '</div>' +
      '</section>';
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

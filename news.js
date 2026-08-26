/* =================================================================
   THE WAVE TALK — JSON-driven news (list · latest · detail)
   Add an item to assets/data/news.json and it appears everywhere.
   ================================================================= */
(function () {
  'use strict';

  var DATA_URL = 'assets/data/news.json';
  var PAGE_SIZE = 6;

  var latestEl = document.getElementById('newsLatest');
  var listEl = document.getElementById('newsList');
  var detailEl = document.getElementById('newsDetail');
  if (!latestEl && !listEl && !detailEl) return; // news.js loaded on a non-news page

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmtDate(s) { return String(s || '').replace(/-/g, '.'); }
  function byDateDesc(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : (b.id - a.id); }

  function thumbHTML(item) {
    if (item.thumbnail) {
      return '<div class="media cover r-169"><img src="' + esc(item.thumbnail) + '" alt="' + esc(item.title) + '" loading="lazy"></div>';
    }
    return '<div class="ph r-169"><div class="ph-inner"><span class="ph-ico">' +
      '<svg viewBox="0 0 48 48"><rect x="7" y="11" width="34" height="26" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="20" r="3.2" fill="currentColor"/><path d="M11 33l8-8 6 5 7-7 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</span><span class="ph-label">' + esc(item.category || '뉴스') + '</span></div></div>';
  }

  function cardHTML(item) {
    return '<a class="news-item" href="news-detail.html?id=' + encodeURIComponent(item.id) + '">' +
      thumbHTML(item) +
      '<div class="news-body">' +
      '<span class="news-cat">' + esc(item.category) + '</span>' +
      '<h3>' + esc(item.title) + '</h3>' +
      '<p>' + esc(item.summary) + '</p>' +
      '<span class="news-date">' + fmtDate(item.date) + '</span>' +
      '</div></a>';
  }

  /* ---------- list page (with "더보기") ---------- */
  function initList(list) {
    var shown = 0;
    var moreWrap = document.getElementById('newsMore');
    var moreBtn = document.getElementById('loadMore');
    function renderMore() {
      var next = list.slice(shown, shown + PAGE_SIZE);
      listEl.insertAdjacentHTML('beforeend', next.map(cardHTML).join(''));
      shown += next.length;
      if (moreWrap) moreWrap.style.display = shown >= list.length ? 'none' : '';
    }
    renderMore();
    if (moreBtn) moreBtn.addEventListener('click', renderMore);
  }

  /* ---------- detail page ---------- */
  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  function renderDetail(list) {
    var id = new URLSearchParams(window.location.search).get('id');
    var idx = list.findIndex(function (x) { return String(x.id) === String(id); });
    if (idx < 0) {
      detailEl.innerHTML = '<p class="news-empty">요청하신 뉴스를 찾을 수 없습니다. <a href="news.html">뉴스 목록으로 돌아가기</a></p>';
      return;
    }
    var item = list[idx];
    var prev = list[idx - 1]; // newer
    var next = list[idx + 1]; // older

    setText('naCat', item.category);
    setText('naTitle', item.title);
    setText('naDate', fmtDate(item.date));
    setText('naCrumb', item.title);
    document.title = item.title + ' | THE WAVE TALK';

    var html = '';
    if (item.image) {
      html += '<div class="media cover r-2x1 na-hero"><img src="' + esc(item.image) + '" alt="' + esc(item.title) + '"></div>';
    }
    html += '<div class="na-content">' + (item.content || '') + '</div>';

    if (item.related && item.related.length) {
      html += '<div class="na-related">' + item.related.map(function (src) {
        return '<div class="media cover r-43"><img src="' + esc(src) + '" alt="' + esc(item.title) + ' 관련 이미지" loading="lazy"></div>';
      }).join('') + '</div>';
    }

    html += '<div class="na-actions">';
    if (item.source) html += '<a class="btn btn-primary" href="' + esc(item.source) + '" target="_blank" rel="noopener">원문 보기 <span class="btn-arrow">↗</span></a>';
    html += '<a class="btn btn-line" href="news.html">목록으로</a></div>';

    html += '<nav class="na-nav">';
    html += prev
      ? '<a class="na-prev" href="news-detail.html?id=' + encodeURIComponent(prev.id) + '"><span>이전글</span>' + esc(prev.title) + '</a>'
      : '<span class="na-prev na-off"><span>이전글</span>이전 글이 없습니다</span>';
    html += next
      ? '<a class="na-next" href="news-detail.html?id=' + encodeURIComponent(next.id) + '"><span>다음글</span>' + esc(next.title) + '</a>'
      : '<span class="na-next na-off"><span>다음글</span>다음 글이 없습니다</span>';
    html += '</nav>';

    detailEl.innerHTML = html;
  }

  /* ---------- render ---------- */
  function render(list) {
    list = (list || []).slice().sort(byDateDesc);
    if (latestEl) latestEl.innerHTML = list.slice(0, 3).map(cardHTML).join('');
    if (listEl) initList(list);
    if (detailEl) renderDetail(list);
  }
  function fail() {
    var msg = '<p class="news-empty">뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>';
    if (latestEl) latestEl.innerHTML = msg;
    if (listEl) listEl.innerHTML = msg;
    if (detailEl) detailEl.innerHTML = msg;
  }

  /* ---------- load + route ----------
     1순위: 임베드된 window.THEWAVE_NEWS (file:// 에서도 동작)
     2순위: assets/data/news.json fetch (서버 호스팅 시) */
  if (Array.isArray(window.THEWAVE_NEWS)) {
    render(window.THEWAVE_NEWS);
  } else if (window.fetch) {
    fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('load fail'); return r.json(); })
      .then(render)
      .catch(fail);
  } else {
    fail();
  }
})();

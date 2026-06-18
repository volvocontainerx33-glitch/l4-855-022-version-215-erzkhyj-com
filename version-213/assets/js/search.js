document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('[data-search-page-form]');
  var input = document.querySelector('[data-search-page-input]');
  var results = document.querySelector('[data-search-results]');
  var count = document.querySelector('[data-search-count]');
  var records = window.MOVIE_SEARCH_INDEX || [];
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('\n');

    return [
      '<article class="movie-card">',
      '  <a class="poster-wrap" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-region">' + escapeHtml(movie.region) + '</span>',
      '    <span class="poster-rating">★ ' + escapeHtml(movie.rating) + '</span>',
      '    <span class="poster-play">播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.duration) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function runSearch(query) {
    var keyword = normalize(query);

    if (!keyword) {
      results.innerHTML = '';
      count.textContent = '请输入关键词开始搜索。';
      return;
    }

    var matched = records.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ');

      return normalize(haystack).indexOf(keyword) !== -1;
    }).slice(0, 120);

    results.innerHTML = matched.map(cardTemplate).join('\n');
    count.textContent = matched.length ? '找到 ' + matched.length + ' 条匹配结果。' : '没有找到匹配结果，请换一个关键词。';
  }

  if (input) {
    input.value = initialQuery;
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch(input.value);
      var nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('q', input.value);
      window.history.replaceState({}, '', nextUrl.toString());
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      runSearch(input.value);
    });
  }

  runSearch(initialQuery);
});

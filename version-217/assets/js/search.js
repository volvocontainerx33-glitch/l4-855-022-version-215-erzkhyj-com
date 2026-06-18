(function () {
  var input = document.getElementById('searchInput');
  var form = document.getElementById('searchForm');
  var results = document.getElementById('searchResults');
  var status = document.getElementById('searchStatus');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  function render(items, query) {
    results.innerHTML = '';

    if (!query) {
      status.textContent = '请输入关键词开始搜索';
      return;
    }

    if (!items.length) {
      status.textContent = '没有找到匹配影片';
      return;
    }

    status.textContent = '搜索结果';

    items.slice(0, 80).forEach(function (item) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.innerHTML = [
        '<a class="poster-link" href="' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="play-dot">▶</span>',
        '</a>',
        '<div class="card-body">',
        '<div class="card-meta"><a href="search.html?q=' + encodeURIComponent(item.category) + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.year) + '</span></div>',
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p>' + escapeHtml(item.description) + '</p>',
        '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
        '</div>'
      ].join('');
      results.appendChild(article);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function search(query) {
    var keyword = query.trim().toLowerCase();
    var items = (window.SEARCH_INDEX || []).filter(function (item) {
      return item.keywords.toLowerCase().indexOf(keyword) > -1;
    });

    render(items, keyword);
  }

  if (input) {
    input.value = initialQuery;
    search(initialQuery);
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', url);
      search(query);
    });
  }
})();

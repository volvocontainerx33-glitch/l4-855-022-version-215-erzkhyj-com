(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (slides.length < 2) return;
    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide-to')) || 0);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  startHero();

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var localSearch = document.querySelector('.local-search');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var localCards = Array.prototype.slice.call(document.querySelectorAll('.category-movies .movie-card'));
  var emptyState = document.querySelector('.empty-state');
  var activeFilter = 'all';

  function filterLocalCards() {
    if (!localCards.length) return;
    var keyword = normalize(localSearch ? localSearch.value : '');
    var visible = 0;

    localCards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region')
      ].join(' '));
      var filterMatch = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var show = filterMatch && keywordMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (localSearch) {
    localSearch.addEventListener('input', filterLocalCards);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterLocalCards();
    });
  });

  function initVideo(video) {
    if (!video || video.dataset.ready === '1') return Promise.resolve();
    var stream = video.getAttribute('data-stream');
    if (!stream) return Promise.resolve();

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.dataset.ready = '1';
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.dataset.ready = '1';
    }

    return Promise.resolve();
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('.player-video');
    var button = shell.querySelector('.play-button');

    function playVideo() {
      initVideo(video).then(function () {
        shell.classList.add('playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            shell.classList.remove('playing');
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('playing');
        }
      });
    }
  });

  var searchInput = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  var searchEmpty = document.getElementById('searchEmpty');

  function cardHtml(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-title="', escapeHtml(item.title), '" data-genre="', escapeHtml(item.genre), '" data-type="', escapeHtml(item.type), '" data-year="', escapeHtml(item.year), '" data-region="', escapeHtml(item.region), '">',
      '<a class="poster-link" href="', item.url, '">',
      '<img src="', item.cover, '" alt="', escapeHtml(item.title), '" loading="lazy">',
      '<span class="score-badge">', Number(item.rating).toFixed(1), '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="', item.url, '">', escapeHtml(item.title), '</a>',
      '<p>', escapeHtml(item.oneLine || ''), '</p>',
      '<div class="card-meta"><span>', escapeHtml(item.year), '</span><span>', escapeHtml(item.region), '</span><span>', escapeHtml(item.type), '</span></div>',
      '<div class="tag-row">', tags, '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[match];
    });
  }

  function runSearch() {
    if (!searchInput || !searchResults || !window.SEARCH_MOVIES) return;
    var params = new URLSearchParams(window.location.search);
    var query = normalize(searchInput.value || params.get('q') || '');
    if (!searchInput.value && params.get('q')) {
      searchInput.value = params.get('q');
    }

    var items = window.SEARCH_MOVIES.filter(function (item) {
      var text = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.oneLine,
        (item.tags || []).join(' ')
      ].join(' '));
      return !query || text.indexOf(query) !== -1;
    }).slice(0, 120);

    searchResults.innerHTML = items.map(cardHtml).join('');
    if (searchEmpty) {
      searchEmpty.hidden = items.length > 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', runSearch);
    runSearch();
  }
})();

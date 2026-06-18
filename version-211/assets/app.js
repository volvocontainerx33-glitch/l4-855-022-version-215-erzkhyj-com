(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      var opened = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!opened));
      panel.hidden = opened;
      button.textContent = opened ? '☰' : '×';
    });
  }

  function initHero() {
    var slides = qsa('.hero-slide');
    if (!slides.length) return;
    var dotsWrap = qs('.hero-dots');
    var index = 0;
    var timer = null;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      if (dotsWrap) {
        qsa('.hero-dot', dotsWrap).forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }
    }

    function start() {
      stop();
      timer = setInterval(function () {
        render(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) clearInterval(timer);
    }

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('span');
        dot.className = 'hero-dot' + (i === 0 ? ' is-active' : '');
        dot.addEventListener('click', function () {
          render(i);
          start();
        });
        dotsWrap.appendChild(dot);
      });
    }

    var prev = qs('[data-hero-prev]');
    var next = qs('[data-hero-next]');
    if (prev) prev.addEventListener('click', function () { render(index - 1); start(); });
    if (next) next.addEventListener('click', function () { render(index + 1); start(); });
    render(0);
    start();
  }

  function initFilters() {
    var input = qs('[data-search-input]');
    var yearSelect = qs('[data-year-filter]');
    var regionSelect = qs('[data-region-filter]');
    var cards = qsa('.searchable-card');
    var noResults = qs('.no-results');
    if (!cards.length) return;

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (input && q) input.value = q;

    function norm(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var keyword = norm(input && input.value);
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var text = norm([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        var visible = matchKeyword && matchYear && matchRegion;
        card.classList.toggle('hidden-card', !visible);
        if (visible) shown += 1;
      });
      if (noResults) noResults.style.display = shown ? 'none' : 'block';
    }

    if (input) input.addEventListener('input', apply);
    if (yearSelect) yearSelect.addEventListener('change', apply);
    if (regionSelect) regionSelect.addEventListener('change', apply);
    apply();
  }

  var hlsPromise;

  function loadHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.onload = function () { resolve(window.Hls); };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return hlsPromise;
  }

  function initPlayers() {
    qsa('.player-shell').forEach(function (shell) {
      var button = qs('.play-button', shell);
      var video = qs('video', shell);
      if (!button || !video) return;
      var stream = button.getAttribute('data-stream');
      var attached = false;

      function attachAndPlay() {
        if (!stream) return;
        shell.classList.add('is-playing');
        video.controls = true;
        var start = function () {
          var playTask = video.play();
          if (playTask && typeof playTask.catch === 'function') playTask.catch(function () {});
        };
        if (attached) {
          start();
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', start, { once: true });
          video.load();
        } else {
          loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
              var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
              hls.loadSource(stream);
              hls.attachMedia(video);
              hls.on(Hls.Events.MANIFEST_PARSED, start);
            } else {
              video.src = stream;
              video.addEventListener('loadedmetadata', start, { once: true });
              video.load();
            }
          }).catch(function () {
            video.src = stream;
            video.addEventListener('loadedmetadata', start, { once: true });
            video.load();
          });
        }
      }

      button.addEventListener('click', attachAndPlay);
      shell.addEventListener('click', function (event) {
        if (event.target === shell || event.target.classList.contains('player-cover')) attachAndPlay();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();

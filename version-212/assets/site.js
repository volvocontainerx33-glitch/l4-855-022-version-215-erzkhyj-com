
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });
    if (active < 0) {
      active = 0;
    }

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }
  }

  function initTabs() {
    var groups = document.querySelectorAll('[data-tabs]');
    groups.forEach(function (group) {
      var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-tab-target]'));
      var panels = Array.prototype.slice.call(group.querySelectorAll('[data-tab-panel]'));
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var target = button.getAttribute('data-tab-target');
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          panels.forEach(function (panel) {
            panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === target);
          });
        });
      });
    });
  }

  function initFilters() {
    var forms = document.querySelectorAll('[data-filter-form]');
    forms.forEach(function (form) {
      var input = form.querySelector('[data-filter-text]');
      var year = form.querySelector('[data-filter-year]');
      var region = form.querySelector('[data-filter-region]');
      var target = document.querySelector(form.getAttribute('data-filter-form')) || document;
      var cards = Array.prototype.slice.call(target.querySelectorAll('[data-card]'));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var regionValue = region ? region.value : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region')).toLowerCase();
          var sameKeyword = !keyword || text.indexOf(keyword) !== -1;
          var sameYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var sameRegion = !regionValue || card.getAttribute('data-region') === regionValue;
          card.classList.toggle('hidden-card', !(sameKeyword && sameYear && sameRegion));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (region) {
        region.addEventListener('change', apply);
      }
    });
  }

  function playVideo(video) {
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  function initPlayer(videoId, coverId, buttonId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    if (!video || !source) {
      return;
    }
    var prepared = false;
    var loading = false;

    function start() {
      if (loading) {
        return;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      if (prepared) {
        playVideo(video);
        return;
      }
      loading = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        prepared = true;
        loading = false;
        playVideo(video);
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          prepared = true;
          loading = false;
          playVideo(video);
        });
        hls.on(window.Hls.Events.ERROR, function () {
          loading = false;
        });
        video.__hls = hls;
      } else {
        video.src = source;
        prepared = true;
        loading = false;
        playVideo(video);
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }

  window.SitePlayer = {
    init: initPlayer
  };

  ready(function () {
    initMenu();
    initHero();
    initTabs();
    initFilters();
  });
})();

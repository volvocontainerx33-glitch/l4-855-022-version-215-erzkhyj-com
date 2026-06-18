(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function inYearRange(year, range) {
    var value = parseInt(year, 10);
    if (!range) {
      return true;
    }
    if (range === '2010-2019') {
      return value >= 2010 && value <= 2019;
    }
    if (range === '2000-2009') {
      return value >= 2000 && value <= 2009;
    }
    if (range === 'before-2000') {
      return value < 2000;
    }
    return String(year) === range;
  }

  function setupFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var section = panel.closest('section') || document;
      var list = qs('[data-filter-list]', section) || qs('[data-filter-list]');
      if (!list) {
        return;
      }
      var cards = qsa('[data-card]', list);
      var input = qs('[data-filter-search]', panel);
      var region = qs('[data-filter-region]', panel);
      var type = qs('[data-filter-type]', panel);
      var year = qs('[data-filter-year]', panel);
      var count = qs('[data-filter-count]', panel);
      var empty = qs('[data-empty-state]', section);

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' ').toLowerCase();
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okRegion = !regionValue || (card.getAttribute('data-region') || '').indexOf(regionValue) !== -1;
          var okType = !typeValue || (card.getAttribute('data-type') || '').indexOf(typeValue) !== -1;
          var okYear = inYearRange(card.getAttribute('data-year') || '', yearValue);
          var ok = okKeyword && okRegion && okType && okYear;
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部';
        }
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();

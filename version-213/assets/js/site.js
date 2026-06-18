document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startAutoPlay();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startAutoPlay();
      });
    });

    hero.addEventListener('mouseenter', stopAutoPlay);
    hero.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  var cardSearch = document.querySelector('[data-card-search]');
  var cardList = document.querySelector('[data-card-list]');
  var emptyState = document.querySelector('[data-empty-state]');
  var activeKind = '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    if (!cardList) {
      return;
    }

    var keyword = normalize(cardSearch ? cardSearch.value : '');
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var kind = card.getAttribute('data-kind') || '';
      var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
      var kindMatched = !activeKind || kind === activeKind;
      var visible = keywordMatched && kindMatched;

      card.hidden = !visible;

      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (cardSearch) {
    cardSearch.addEventListener('input', filterCards);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-kind]')).forEach(function (button) {
    button.addEventListener('click', function () {
      activeKind = button.getAttribute('data-filter-kind') || '';
      Array.prototype.slice.call(document.querySelectorAll('[data-filter-kind]')).forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  });
});

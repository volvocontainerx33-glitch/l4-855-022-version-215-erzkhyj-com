(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        showSlide(itemIndex);
      });
    });

    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-card-filter]');
  var grid = document.querySelector('[data-card-grid]');

  if (filterInput && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title || '',
          card.dataset.tags || '',
          card.dataset.genre || '',
          card.dataset.region || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();

        card.style.display = haystack.indexOf(keyword) > -1 ? '' : 'none';
      });
    });
  }
})();

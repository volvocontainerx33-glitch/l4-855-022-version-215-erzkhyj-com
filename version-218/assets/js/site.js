(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (menuButton && panel) {
        menuButton.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dotsWrap = hero.querySelector('[data-hero-dots]');
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            if (dotsWrap) {
                Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (dotsWrap) {
            slides.forEach(function (_, slideIndex) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换推荐 ' + (slideIndex + 1));
                dot.addEventListener('click', function () {
                    show(slideIndex);
                    restart();
                });
                dotsWrap.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]')).forEach(function (input) {
        var targetSelector = input.getAttribute('data-target');
        var grid = targetSelector ? document.querySelector(targetSelector) : document;
        var empty = document.querySelector('[data-empty-message]');

        function filterCards() {
            var value = input.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || card.textContent.toLowerCase();
                var matched = !value || haystack.indexOf(value) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', filterCards);

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
            filterCards();
        }
    });
})();

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById('movieVideo');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-play-button]');
    var hlsPlayer = null;
    var bound = false;

    if (!video || !sourceUrl) {
        return;
    }

    function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    function bindSource(autoplay) {
        if (bound) {
            if (autoplay) {
                playVideo();
            }
            return;
        }

        bound = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            if (autoplay) {
                playVideo();
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(sourceUrl);
            hlsPlayer.attachMedia(video);
            hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (autoplay) {
                    playVideo();
                }
            });
            return;
        }

        video.src = sourceUrl;
        if (autoplay) {
            playVideo();
        }
    }

    function start() {
        if (cover) {
            cover.classList.add('is-hidden');
        }
        bindSource(true);
    }

    if (button) {
        button.addEventListener('click', start);
    }

    if (cover) {
        cover.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 && cover) {
            cover.classList.remove('is-hidden');
        }
    });
}

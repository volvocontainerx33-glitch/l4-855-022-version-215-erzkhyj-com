(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    const searchInput = document.querySelector("[data-search-input]");
    const yearFilter = document.querySelector("[data-year-filter]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        const keyword = normalize(searchInput ? searchInput.value : "");
        const year = yearFilter ? yearFilter.value : "";

        cards.forEach(function (card) {
            const content = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.tags
            ].join(" "));
            const yearMatched = !year || card.dataset.year === year;
            const keywordMatched = !keyword || content.indexOf(keyword) !== -1;
            card.classList.toggle("is-filtered-out", !(yearMatched && keywordMatched));
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
    }
})();

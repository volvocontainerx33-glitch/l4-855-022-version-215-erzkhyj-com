function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
        return;
    }

    button.addEventListener("click", function () {
        panel.classList.toggle("is-open");
    });
}

function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
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

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
}

function initFilterBars() {
    var scopes = document.querySelectorAll("[data-filter-scope]");

    scopes.forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var year = scope.querySelector("[data-filter-year]");
        var reset = scope.querySelector("[data-filter-reset]");
        var section = scope.nextElementSibling;
        var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".movie-card")) : [];
        var empty = section ? section.querySelector("[data-filter-empty]") : null;

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var shown = 0;

            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var category = (card.getAttribute("data-category") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var genre = (card.getAttribute("data-genre") || "").toLowerCase();
                var matchesKeyword = !keyword || title.indexOf(keyword) !== -1 || category.indexOf(keyword) !== -1 || genre.indexOf(keyword) !== -1;
                var matchesYear = !selectedYear || cardYear === selectedYear;
                var visible = matchesKeyword && matchesYear;

                card.hidden = !visible;

                if (visible) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        if (year) {
            year.addEventListener("change", applyFilter);
        }

        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (year) {
                    year.value = "";
                }
                applyFilter();
            });
        }
    });
}

function createMovieCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
        '<a href="' + movie.url + '" class="movie-card__link" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <div class="poster-shell">',
        '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" class="poster-img" loading="lazy" data-fallback="poster">',
        '        <span class="movie-card__category">' + escapeHtml(movie.category) + '</span>',
        '        <span class="movie-card__play" aria-hidden="true">▶</span>',
        '        <div class="movie-card__meta-overlay">',
        '            <span>' + movie.views + ' 次观看</span>',
        '            <span>★ ' + movie.rating + '</span>',
        '        </div>',
        '    </div>',
        '    <div class="movie-card__body">',
        '        <h3>' + escapeHtml(movie.title) + '</h3>',
        '        <p>' + escapeHtml(movie.description) + '</p>',
        '        <div class="movie-card__info">',
        '            <span>' + movie.year + '</span>',
        '            <span>' + escapeHtml(movie.region) + '</span>',
        '            <span>' + escapeHtml(movie.type) + '</span>',
        '        </div>',
        '    </div>',
        '</a>'
    ].join("");
    return article;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function initSearchPage() {
    var page = document.querySelector("[data-search-page]");

    if (!page || !window.MOVIE_DATA) {
        return;
    }

    var form = page.querySelector("[data-search-form]");
    var input = page.querySelector("[data-search-input]");
    var category = page.querySelector("[data-search-category]");
    var results = page.querySelector("[data-search-results]");
    var summary = page.querySelector("[data-search-summary]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    input.value = initialQuery;

    function render() {
        var keyword = input.value.trim().toLowerCase();
        var selectedCategory = category.value;

        results.innerHTML = "";

        if (!keyword && !selectedCategory) {
            summary.textContent = "输入关键词后显示结果。";
            return;
        }

        var filtered = window.MOVIE_DATA.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.description,
                movie.category,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesCategory = !selectedCategory || movie.category === selectedCategory;
            return matchesKeyword && matchesCategory;
        }).slice(0, 120);

        summary.textContent = "找到 " + filtered.length + " 条结果" + (filtered.length === 120 ? "（已显示前 120 条）" : "") + "。";

        filtered.forEach(function (movie) {
            results.appendChild(createMovieCard(movie));
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var nextUrl = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
        window.history.replaceState({}, "", nextUrl);
        render();
    });

    input.addEventListener("input", render);
    category.addEventListener("change", render);
    render();
}

function initPlayers() {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-player-button]");
        var status = player.querySelector("[data-player-status]");
        var source = player.getAttribute("data-m3u8");
        var hlsInstance = null;
        var initialized = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function startPlayback() {
            if (!video || !source) {
                setStatus("未找到播放器或播放源。");
                return;
            }

            player.classList.add("is-playing");

            if (!initialized) {
                initialized = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源加载完成，正在播放。");
                        video.play().catch(function () {
                            setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("播放源加载失败，请检查网络或替换 m3u8 地址。");
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        setStatus("播放源加载完成，正在播放。");
                        video.play().catch(function () {
                            setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
                        });
                    }, { once: true });
                } else {
                    setStatus("当前浏览器不支持 HLS，请使用新版 Chrome、Edge、Firefox 或 Safari。 ");
                    return;
                }
            } else {
                video.play().catch(function () {
                    setStatus("请再次点击播放器或检查浏览器播放权限。");
                });
            }
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", function () {
            player.classList.add("is-playing");
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

function initImageFallbacks() {
    var images = document.querySelectorAll("img[data-fallback='poster']");

    images.forEach(function (image) {
        image.addEventListener("error", function () {
            var shell = image.closest(".poster-shell");
            image.style.display = "none";
            if (shell) {
                shell.classList.add("poster-shell--missing");
            }
        }, { once: true });
    });
}

function initCopyLinks() {
    var buttons = document.querySelectorAll("[data-copy-link]");

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            var url = window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(function () {
                    button.textContent = "已复制";
                    window.setTimeout(function () {
                        button.textContent = "分享链接";
                    }, 1600);
                });
            }
        });
    });
}

ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initFilterBars();
    initSearchPage();
    initPlayers();
    initImageFallbacks();
    initCopyLinks();
});

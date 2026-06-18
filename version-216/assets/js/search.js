function getQuery() {
  var params = new URLSearchParams(window.location.search);
  return (params.get("q") || "").trim();
}

function createCard(movie) {
  var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
    return "<span>" + escapeHtml(tag) + "</span>";
  }).join("");
  return "<article class=\"movie-card\">" +
    "<a class=\"poster-wrap\" href=\"./" + escapeHtml(movie.href) + "\">" +
    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" />" +
    "<span class=\"poster-score\">" + escapeHtml(movie.rating) + "</span>" +
    "<span class=\"poster-play\">播放</span>" +
    "</a>" +
    "<div class=\"movie-card-body\">" +
    "<h2><a href=\"./" + escapeHtml(movie.href) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
    "<p class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
    "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
    "<div class=\"tag-row\">" + tags + "</div>" +
    "</div>" +
    "</article>";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function runSearch() {
  var query = getQuery();
  var input = document.querySelector("[data-search-input]");
  var title = document.querySelector("[data-search-title]");
  var results = document.querySelector("[data-search-results]");
  var data = window.MovieSearchData || [];

  if (input) {
    input.value = query;
  }
  if (!results) {
    return;
  }
  if (!query) {
    results.innerHTML = "<div class=\"empty-results\">请输入关键词搜索影片。</div>";
    return;
  }

  var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
  var matched = data.filter(function (movie) {
    var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
    return keywords.every(function (keyword) {
      return haystack.indexOf(keyword) !== -1;
    });
  }).slice(0, 120);

  if (title) {
    title.textContent = "“" + query + "” 的搜索结果";
  }
  if (!matched.length) {
    results.innerHTML = "<div class=\"empty-results\">没有找到匹配影片，请尝试更换关键词。</div>";
    return;
  }
  results.innerHTML = matched.map(createCard).join("");
  results.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("hide-image");
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runSearch);
} else {
  runSearch();
}

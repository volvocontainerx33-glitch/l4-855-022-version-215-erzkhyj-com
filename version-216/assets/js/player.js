function initializePlayer(root) {
  var video = root.querySelector("video");
  var button = root.querySelector("[data-play-button]");
  var source = root.getAttribute("data-source");
  var hls = null;
  var prepared = false;

  function prepare() {
    if (prepared || !video || !source) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.load();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }
    video.src = source;
    video.load();
  }

  function play() {
    prepare();
    if (button) {
      button.classList.add("is-hidden");
    }
    if (video) {
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        play();
      }
    });
  }
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(initializePlayer);
  });
} else {
  document.querySelectorAll("[data-player]").forEach(initializePlayer);
}

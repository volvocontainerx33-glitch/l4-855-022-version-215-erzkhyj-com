import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(card) {
  var video = card.querySelector('.video-player');
  var trigger = card.querySelector('[data-play-trigger]');
  var initialized = false;

  if (!video || !trigger) {
    return;
  }

  function initializeAndPlay() {
    var source = video.getAttribute('data-src');
    if (!source) {
      return;
    }

    if (!initialized) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      initialized = true;
    }

    trigger.classList.add('is-hidden');
    video.play().catch(function () {
      trigger.classList.remove('is-hidden');
    });
  }

  trigger.addEventListener('click', initializeAndPlay);
  video.addEventListener('click', function () {
    if (!initialized) {
      initializeAndPlay();
    }
  });
  video.addEventListener('play', function () {
    trigger.classList.add('is-hidden');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player-card]').forEach(setupPlayer);
});

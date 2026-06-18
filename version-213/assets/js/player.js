import { H as Hls } from '../vendor/hls-vendor-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-play-trigger]');
    var message = shell.querySelector('[data-player-message]');
    var source = shell.getAttribute('data-video-url');
    var hls = null;
    var loaded = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }
    }

    function loadSource() {
      if (!video || !source) {
        setMessage('没有可用的播放源。');
        return;
      }

      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;
      setMessage('正在加载 m3u8 播放源...');

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源已就绪。');
          playVideo();
        });

        hls.on(Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage('网络异常，正在重新加载播放源。');
            hls.startLoad();
            return;
          }

          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage('媒体解析异常，正在尝试恢复。');
            hls.recoverMediaError();
            return;
          }

          setMessage('播放源暂时无法加载，请稍后重试。');
          hls.destroy();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setMessage('播放源已就绪。');
          playVideo();
        }, { once: true });
      } else {
        setMessage('当前浏览器不支持 HLS 播放，请更换浏览器或通过支持 HLS 的环境访问。');
      }
    }

    if (trigger) {
      trigger.addEventListener('click', loadSource);
    }

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
});

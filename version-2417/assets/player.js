(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function attachStream(video, source) {
    if (!video || !source) {
      return null;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return null;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
      });
      return hls;
    }

    video.src = source;
    return null;
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var overlay = box.querySelector('.player-overlay');
      var source = box.getAttribute('data-stream');
      var attached = false;

      function startPlayback() {
        if (!attached) {
          attachStream(video, source);
          attached = true;
        }
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        if (video) {
          video.controls = true;
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        }
      }

      if (overlay) {
        overlay.addEventListener('click', startPlayback);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            startPlayback();
          }
        });
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
      }
    });
  });
})();

(function () {
  function initPlayer() {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('videoOverlay');
    var shell = video ? video.closest('.video-shell') : null;
    var stream = video ? video.getAttribute('data-stream') : '';
    var hls = null;
    var attached = false;

    if (!video || !stream) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }

      video.src = stream;
    }

    function startPlayback() {
      attachStream();
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    attachStream();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
})();

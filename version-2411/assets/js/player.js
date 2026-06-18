(function () {
  var hlsLibraryUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
  var hlsLoading = null;

  function loadLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoading) {
      return hlsLoading;
    }
    hlsLoading = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsLibraryUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("video"));
      };
      document.head.appendChild(script);
    });
    return hlsLoading;
  }

  function attachWithHls(video, url) {
    if (video._hlsPlayer) {
      video._hlsPlayer.destroy();
      video._hlsPlayer = null;
    }
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });
    video._hlsPlayer = hls;
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
        video._hlsPlayer = null;
      }
    });
  }

  function attachNative(video, url) {
    if (!video.getAttribute("src")) {
      video.src = url;
    }
  }

  function prepare(video, url) {
    if (video.getAttribute("data-ready") === "true") {
      return Promise.resolve();
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      attachNative(video, url);
      video.setAttribute("data-ready", "true");
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      attachWithHls(video, url);
      video.setAttribute("data-ready", "true");
      return Promise.resolve();
    }
    return loadLibrary().then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        attachWithHls(video, url);
        video.setAttribute("data-ready", "true");
      }
    });
  }

  window.startMoviePlayer = function (url) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-player-button]");
    if (!video || !url) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function play() {
      hideOverlay();
      prepare(video, url).then(function () {
        var started = video.play();
        if (started && typeof started.catch === "function") {
          started.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }).catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("play", hideOverlay);
    video.addEventListener("loadedmetadata", hideOverlay);
  };
})();

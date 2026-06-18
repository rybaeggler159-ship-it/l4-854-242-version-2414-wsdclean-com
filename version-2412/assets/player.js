import { H as Hls } from "./hls.js";

export function mountPlayer(source) {
  var video = document.querySelector("[data-player]");
  var cover = document.querySelector("[data-player-cover]");
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button]"));
  var attached = false;
  var instance = null;

  if (!video) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (Hls.isSupported()) {
      instance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      instance.loadSource(source);
      instance.attachMedia(video);
      return;
    }
    video.src = source;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  }

  function start() {
    attach();
    hideCover();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", start);
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", hideCover);

  window.addEventListener("pagehide", function () {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  });
}

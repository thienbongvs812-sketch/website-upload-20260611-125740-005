function initMoviePlayer(source) {
  var video = document.querySelector("[data-player-video]");
  var trigger = document.querySelector("[data-player-trigger]");
  var started = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function attach() {
    if (started) {
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    attach();
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
    video.controls = true;
    var pending = video.play();
    if (pending && typeof pending.catch === "function") {
      pending.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

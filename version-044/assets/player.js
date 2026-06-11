(function () {
  var hlsLoaderPromise = null;

  function getMessage(player) {
    return player.querySelector('[data-player-message]');
  }

  function setMessage(player, text) {
    var message = getMessage(player);

    if (message) {
      message.textContent = text || '';
    }
  }

  function loadLocalHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsLoaderPromise) {
      hlsLoaderPromise = import('./video-vendor-dru42stk.js').then(function (module) {
        return module.H;
      }).catch(function () {
        return null;
      });
    }

    return hlsLoaderPromise;
  }

  function attachSource(video, sourceUrl, HlsConstructor) {
    return new Promise(function (resolve, reject) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        resolve();
        return;
      }

      if (HlsConstructor && HlsConstructor.isSupported()) {
        var hls = new HlsConstructor({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        video.__hlsInstance = hls;

        hls.on(HlsConstructor.Events.MANIFEST_PARSED, function () {
          resolve();
        });

        hls.on(HlsConstructor.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === HlsConstructor.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === HlsConstructor.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              reject(new Error('播放源加载失败'));
            }
          }
        });

        return;
      }

      video.src = sourceUrl;
      resolve();
    });
  }

  function startPlayer(player) {
    var video = player.querySelector('video');
    var sourceUrl = player.dataset.m3u8;

    if (!video || !sourceUrl) {
      setMessage(player, '当前影片缺少可用播放源。');
      return;
    }

    setMessage(player, '正在加载高清播放源...');

    loadLocalHls().then(function (HlsConstructor) {
      return attachSource(video, sourceUrl, HlsConstructor);
    }).then(function () {
      player.classList.add('is-playing');
      setMessage(player, '');
      return video.play();
    }).catch(function () {
      player.classList.add('is-playing');
      setMessage(player, '浏览器已拦截自动播放，请点击播放器中的播放按钮。');
    });
  }

  document.addEventListener('click', function (event) {
    var startButton = event.target.closest('[data-player-start]');

    if (!startButton) {
      return;
    }

    var player = startButton.closest('[data-player]');

    if (player) {
      startPlayer(player);
    }
  });
}());

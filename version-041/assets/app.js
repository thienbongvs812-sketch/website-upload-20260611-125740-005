(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === currentSlide);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search], .ranking-row[data-search]'));

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter') || '';
        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        cards.forEach(function (card) {
          var haystack = card.getAttribute('data-search') || '';
          card.style.display = !value || haystack.indexOf(value.toLowerCase()) !== -1 ? '' : 'none';
        });
      });
    });

    var searchInput = document.querySelector('[data-search-input]');
    var searchCards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

    function runSearch() {
      if (!searchInput) {
        return;
      }
      var value = searchInput.value.trim().toLowerCase();
      searchCards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        card.style.display = haystack.indexOf(value) !== -1 ? '' : 'none';
      });
    }

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        searchInput.value = query;
      }
      searchInput.addEventListener('input', runSearch);
      runSearch();
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-start');
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;

      function attach() {
        if (!video || !stream || video.getAttribute('data-ready') === 'true') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', 'true');
      }

      function play() {
        if (!video) {
          return;
        }
        attach();
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (video.currentTime === 0) {
            player.classList.remove('is-playing');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();

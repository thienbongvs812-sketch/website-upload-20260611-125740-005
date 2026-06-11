(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("data-search-target") || "search.html";
        if (query) {
          window.location.href = target + "?q=" + encodeURIComponent(query);
          return;
        }
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        play();
      });
    });

    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    hero.addEventListener("mouseleave", function () {
      window.clearInterval(timer);
      play();
    });

    show(0);
    play();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var category = document.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var categoryValue = category ? category.value : "";
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-query") || "").toLowerCase();
        var cardCategory = card.getAttribute("data-category") || "";
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchCategory = !categoryValue || cardCategory === categoryValue;
        card.hidden = !(matchQuery && matchCategory);
      });
    }

    input.addEventListener("input", apply);
    if (category) {
      category.addEventListener("change", apply);
    }
    apply();
  }

  function initPlayers() {
    document.querySelectorAll("[data-player-box]").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-player-start]");
      var stream = box.getAttribute("data-stream");
      var started = false;
      var hls = null;

      if (!video || !button || !stream) {
        return;
      }

      function start() {
        if (!started) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          started = true;
        }
        box.classList.add("is-playing");
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });

      box.addEventListener("click", function (event) {
        if (event.target === video || button.contains(event.target)) {
          return;
        }
        start();
      });

      video.addEventListener("click", function () {
        if (!started || video.paused) {
          start();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
  });
})();

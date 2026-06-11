(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobilePanel.classList.contains("is-open"));
      });
    }

    document.querySelectorAll("[data-header-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "browse.html" + (query ? "?q=" + encodeURIComponent(query) : "");
        window.location.href = target;
      });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        stop();
        timer = setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var category = scope.querySelector("[data-filter-category]");
      var sort = scope.querySelector("[data-filter-sort]");
      var list = scope.querySelector("[data-filter-list]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function apply() {
        if (!list) {
          return;
        }
        var query = normalize(input ? input.value : "");
        var selected = category ? category.value : "";
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var cardCategory = card.getAttribute("data-category") || "";
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedCategory = !selected || cardCategory === selected;
          card.classList.toggle("is-hidden", !(matchedQuery && matchedCategory));
        });

        if (sort) {
          var mode = sort.value;
          cards.sort(function (a, b) {
            if (mode === "title") {
              return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
            }
            if (mode === "views") {
              return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
            }
            if (mode === "rating") {
              return Number(b.getAttribute("data-rating") || 0) - Number(a.getAttribute("data-rating") || 0);
            }
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          });
          cards.forEach(function (card) {
            list.appendChild(card);
          });
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (category) {
        category.addEventListener("change", apply);
      }
      if (sort) {
        sort.addEventListener("change", apply);
      }
      apply();
    });
  });
})();

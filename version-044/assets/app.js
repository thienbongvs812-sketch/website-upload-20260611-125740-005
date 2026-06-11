(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function getRootPrefix() {
    return document.body ? (document.body.dataset.rootPrefix || './') : './';
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initGlobalSearch() {
    var forms = document.querySelectorAll('[data-global-search]');

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = getRootPrefix() + 'search.html';

        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }

        window.location.href = target;
      });
    });
  }

  function initHeroSliders() {
    var sliders = document.querySelectorAll('[data-hero]');

    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      if (!slides.length) {
        return;
      }

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.dataset.heroDot || 0));
          start();
        });
      });

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function uniqueSorted(values) {
    var seen = Object.create(null);
    var result = [];

    values.forEach(function (value) {
      value = String(value || '').trim();

      if (value && !seen[value]) {
        seen[value] = true;
        result.push(value);
      }
    });

    return result.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select || select.options.length > 1) {
      return;
    }

    uniqueSorted(values).forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');

    if (!panel || !cards.length) {
      return;
    }

    var searchInput = panel.querySelector('[data-filter-search]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var countNode = panel.querySelector('[data-filter-count]');

    fillSelect(yearSelect, cards.map(function (card) { return card.dataset.year; }));
    fillSelect(regionSelect, cards.map(function (card) { return card.dataset.region; }));
    fillSelect(typeSelect, cards.map(function (card) { return card.dataset.type; }));

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');

    if (queryFromUrl && searchInput) {
      searchInput.value = queryFromUrl;
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = String(card.dataset.search || '').toLowerCase();
        var matchesQuery = !query || searchText.indexOf(query) !== -1;
        var matchesYear = !year || card.dataset.year === year;
        var matchesRegion = !region || card.dataset.region === region;
        var matchesType = !type || card.dataset.type === type;
        var shouldShow = matchesQuery && matchesYear && matchesRegion && matchesType;

        card.hidden = !shouldShow;

        if (shouldShow) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
      }

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (node) {
      if (!node) {
        return;
      }

      node.addEventListener('input', applyFilters);
      node.addEventListener('change', applyFilters);
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  ready(function () {
    initMobileMenu();
    initGlobalSearch();
    initHeroSliders();
    initFilters();
  });
}());

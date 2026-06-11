(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initNav() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                play();
            });
        });
        show(0);
        play();
    }

    function initRails() {
        document.querySelectorAll('[data-rail]').forEach(function (rail) {
            var section = rail.closest('.section');
            if (!section) {
                return;
            }
            var left = section.querySelector('[data-scroll-left]');
            var right = section.querySelector('[data-scroll-right]');
            if (left) {
                left.addEventListener('click', function () {
                    rail.scrollBy({ left: -420, behavior: 'smooth' });
                });
            }
            if (right) {
                right.addEventListener('click', function () {
                    rail.scrollBy({ left: 420, behavior: 'smooth' });
                });
            }
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-area]').forEach(function (area) {
            var input = area.querySelector('[data-filter-input]');
            var year = area.querySelector('[data-filter-year]');
            var genre = area.querySelector('[data-filter-genre]');
            var reset = area.querySelector('[data-filter-reset]');
            var cards = Array.prototype.slice.call(area.querySelectorAll('[data-filter-card]'));

            function apply() {
                var q = normalize(input && input.value);
                var y = normalize(year && year.value);
                var g = normalize(genre && genre.value);
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region')
                    ].join(' '));
                    var passQuery = !q || text.indexOf(q) !== -1;
                    var passYear = !y || normalize(card.getAttribute('data-year')) === y;
                    var passGenre = !g || normalize(card.getAttribute('data-genre')).indexOf(g) !== -1;
                    card.classList.toggle('hidden-card', !(passQuery && passYear && passGenre));
                });
            }

            [input, year, genre].forEach(function (node) {
                if (node) {
                    node.addEventListener('input', apply);
                    node.addEventListener('change', apply);
                }
            });
            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (genre) {
                        genre.value = '';
                    }
                    apply();
                });
            }
        });
    }

    function initPlayer() {
        document.querySelectorAll('[data-player]').forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.player-overlay');
            var src = box.getAttribute('data-stream');
            var started = false;
            if (!video || !button || !src) {
                return;
            }

            function attach() {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else {
                    video.src = src;
                }
                button.classList.add('is-hidden');
                video.setAttribute('controls', 'controls');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            button.addEventListener('click', attach);
            video.addEventListener('click', function () {
                if (!started) {
                    attach();
                }
            });
        });
    }

    function cardTemplate(item) {
        return [
            '<article class="movie-card" data-filter-card data-title="', item.title, '" data-year="', item.year, '" data-genre="', item.genre, ' ', item.tags, '" data-region="', item.region, '">',
            '<a href="./', item.file, '" aria-label="', item.title, '">',
            '<span class="poster-wrap"><img src="', item.cover, '" alt="', item.title, '" loading="lazy"><span class="poster-gradient"></span></span>',
            '<span class="movie-info"><strong>', item.title, '</strong><span>', item.year, ' · ', item.region, ' · ', item.category, '</span></span>',
            '<span class="play-chip">▶</span>',
            '</a>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-input]');
        var results = document.querySelector('[data-search-results]');
        if (!form || !input || !results || !window.SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;

        function render(value) {
            var q = normalize(value);
            var list = window.SEARCH_DATA.filter(function (item) {
                var text = normalize([item.title, item.year, item.region, item.genre, item.tags, item.category, item.oneLine].join(' '));
                return !q || text.indexOf(q) !== -1;
            }).slice(0, 240);
            if (!list.length) {
                results.innerHTML = '<div class="empty-state">没有匹配的影片，换个关键词试试</div>';
                return;
            }
            results.innerHTML = list.map(cardTemplate).join('');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var nextUrl = './search.html?q=' + encodeURIComponent(input.value.trim());
            window.history.replaceState({}, '', nextUrl);
            render(input.value);
        });
        input.addEventListener('input', function () {
            render(input.value);
        });
        render(query);
    }

    ready(function () {
        initNav();
        initHero();
        initRails();
        initFilters();
        initPlayer();
        initSearchPage();
    });
}());

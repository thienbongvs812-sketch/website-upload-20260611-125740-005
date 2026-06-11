const SELECTORS = {
    heroCarousel: '[data-hero-carousel]',
    heroSlide: '[data-hero-slide]',
    heroDot: '[data-hero-dot]',
    heroPrev: '[data-hero-prev]',
    heroNext: '[data-hero-next]',
    movieCard: '[data-movie-card]',
    filterPanel: '[data-filter-panel]',
    player: '[data-video-player]'
};

function initNavigation() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-main-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function initBackTop() {
    const button = document.querySelector('[data-back-top]');

    if (!button) {
        return;
    }

    window.addEventListener('scroll', () => {
        button.classList.toggle('is-visible', window.scrollY > 480);
    }, { passive: true });

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initHeroCarousel() {
    const carousel = document.querySelector(SELECTORS.heroCarousel);

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll(SELECTORS.heroSlide));
    const dots = Array.from(carousel.querySelectorAll(SELECTORS.heroDot));
    const prev = carousel.querySelector(SELECTORS.heroPrev);
    const next = carousel.querySelector(SELECTORS.heroNext);
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function restartTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(() => showSlide(current + 1), 5000);
    }

    prev?.addEventListener('click', () => {
        showSlide(current - 1);
        restartTimer();
    });

    next?.addEventListener('click', () => {
        showSlide(current + 1);
        restartTimer();
    });

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.heroDot || 0));
            restartTimer();
        });
    });

    showSlide(0);
    restartTimer();
}

function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
}

function initFilterPanel(panel) {
    const scope = panel.closest('section') || document;
    const search = panel.querySelector('[data-search-input]');
    const region = panel.querySelector('[data-filter-region]');
    const type = panel.querySelector('[data-filter-type]');
    const year = panel.querySelector('[data-filter-year]');
    const reset = panel.querySelector('[data-filter-reset]');
    const count = panel.querySelector('[data-filter-count]');
    const grid = scope.querySelector('[data-grid]') || document;
    const cards = Array.from(grid.querySelectorAll(SELECTORS.movieCard));

    function applyFilters() {
        const query = normalize(search?.value);
        const selectedRegion = normalize(region?.value);
        const selectedType = normalize(type?.value);
        const selectedYear = normalize(year?.value);
        let visible = 0;

        cards.forEach((card) => {
            const title = normalize(card.dataset.title);
            const tags = normalize(card.dataset.tags);
            const cardRegion = normalize(card.dataset.region);
            const cardType = normalize(card.dataset.type);
            const cardYear = normalize(card.dataset.year);
            const queryMatched = !query || title.includes(query) || tags.includes(query) || cardRegion.includes(query) || cardType.includes(query) || cardYear.includes(query);
            const regionMatched = !selectedRegion || cardRegion === selectedRegion;
            const typeMatched = !selectedType || cardType === selectedType;
            const yearMatched = !selectedYear || cardYear === selectedYear;
            const matched = queryMatched && regionMatched && typeMatched && yearMatched;

            card.classList.toggle('is-hidden', !matched);

            if (matched) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = visible ? `当前显示 ${visible} 条影片` : '没有找到匹配影片，请更换关键词或重置筛选';
        }
    }

    search?.addEventListener('input', applyFilters);
    region?.addEventListener('change', applyFilters);
    type?.addEventListener('change', applyFilters);
    year?.addEventListener('change', applyFilters);
    reset?.addEventListener('click', () => {
        if (search) {
            search.value = '';
        }
        if (region) {
            region.value = '';
        }
        if (type) {
            type.value = '';
        }
        if (year) {
            year.value = '';
        }
        applyFilters();
    });

    applyFilters();
}

function initFilters() {
    document.querySelectorAll(SELECTORS.filterPanel).forEach(initFilterPanel);
}

function initHomeSearch() {
    const input = document.querySelector('[data-home-search]');
    const link = document.querySelector('[data-home-search-link]');

    if (!input || !link) {
        return;
    }

    function updateLink() {
        const query = input.value.trim();
        link.href = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
    }

    input.addEventListener('input', updateLink);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            updateLink();
            window.location.href = link.href;
        }
    });
    updateLink();
}

function applySearchParam() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (!query) {
        return;
    }

    const input = document.querySelector('[data-search-input]');

    if (input) {
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

async function attachHlsOrFallback(video, hlsUrl, mp4Url) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        return;
    }

    try {
        const module = await import('./hls-local.js');
        const Hls = module.H;

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return;
        }
    } catch (error) {
        console.warn('HLS module unavailable, using MP4 fallback.', error);
    }

    video.src = mp4Url;
}

function initPlayers() {
    document.querySelectorAll(SELECTORS.player).forEach((player) => {
        const video = player.querySelector('video');
        const cover = player.querySelector('[data-player-cover]');
        const hlsUrl = player.dataset.hls;
        const mp4Url = player.dataset.mp4;
        let initialized = false;

        async function startPlayback() {
            if (!video || !hlsUrl || !mp4Url) {
                return;
            }

            cover?.classList.add('is-hidden');

            if (!initialized) {
                initialized = true;
                await attachHlsOrFallback(video, hlsUrl, mp4Url);
            }

            try {
                await video.play();
            } catch (error) {
                console.warn('Playback needs a second user gesture.', error);
                cover?.classList.remove('is-hidden');
            }
        }

        cover?.addEventListener('click', startPlayback);
        player.addEventListener('click', (event) => {
            if (event.target === video && video.paused) {
                startPlayback();
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initBackTop();
    initHeroCarousel();
    initFilters();
    initHomeSearch();
    initPlayers();
    applySearchParam();
});

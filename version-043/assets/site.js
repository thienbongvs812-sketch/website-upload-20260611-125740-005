import { H as Hls } from "./video-vendor-dru42stk.js";

function initMobileMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
        return;
    }

    button.addEventListener("click", () => {
        nav.classList.toggle("open");
        button.classList.toggle("open");
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const next = hero.querySelector("[data-hero-next]");
    const prev = hero.querySelector("[data-hero-prev]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === index);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(() => show(index + 1), 5000);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    next?.addEventListener("click", () => {
        show(index + 1);
        start();
    });

    prev?.addEventListener("click", () => {
        show(index - 1);
        start();
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            show(Number(dot.dataset.heroDot));
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
}

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function initFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
        const input = scope.querySelector("[data-filter-input]");
        const typeSelect = scope.querySelector("[data-filter-type]");
        const yearSelect = scope.querySelector("[data-filter-year]");
        const regionSelect = scope.querySelector("[data-filter-region]");
        const reset = scope.querySelector("[data-filter-reset]");
        const count = scope.querySelector("[data-filter-count]");
        const cards = Array.from(scope.querySelectorAll(".movie-card"));
        const params = new URLSearchParams(window.location.search);

        if (input && params.has("q")) {
            input.value = params.get("q") || "";
        }

        if (yearSelect && params.has("year")) {
            yearSelect.value = params.get("year") || "";
        }

        function apply() {
            const keyword = normalize(input?.value);
            const type = normalize(typeSelect?.value);
            const year = normalize(yearSelect?.value);
            const region = normalize(regionSelect?.value);
            let visible = 0;

            cards.forEach((card) => {
                const text = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent
                ].join(" "));

                const matchesKeyword = !keyword || text.includes(keyword);
                const matchesType = !type || normalize(card.dataset.type).includes(type);
                const matchesYear = !year || normalize(card.dataset.year) === year;
                const matchesRegion = !region || normalize(card.dataset.region).includes(region);
                const shouldShow = matchesKeyword && matchesType && matchesYear && matchesRegion;

                card.classList.toggle("is-hidden", !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        [input, typeSelect, yearSelect, regionSelect].forEach((control) => {
            control?.addEventListener("input", apply);
            control?.addEventListener("change", apply);
        });

        reset?.addEventListener("click", () => {
            if (input) input.value = "";
            if (typeSelect) typeSelect.value = "";
            if (yearSelect) yearSelect.value = "";
            if (regionSelect) regionSelect.value = "";
            apply();
        });

        apply();
    });
}

function initPlayers() {
    document.querySelectorAll(".movie-player").forEach((player) => {
        const video = player.querySelector("video");
        const overlay = player.querySelector(".play-overlay");
        const source = video?.dataset.hlsSrc;
        let attached = false;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (!data.fatal) {
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });

                return;
            }

            video.src = source;
        }

        overlay?.addEventListener("click", async () => {
            attachSource();
            player.classList.add("is-playing");

            try {
                await video.play();
            } catch (_error) {
                player.classList.remove("is-playing");
            }
        });

        video.addEventListener("play", () => player.classList.add("is-playing"));
        video.addEventListener("pause", () => player.classList.remove("is-playing"));
        video.addEventListener("click", attachSource, { once: true });
    });
}

function initPlayerScroll() {
    document.querySelectorAll("[data-scroll-player]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            document.querySelector(".movie-player")?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    });
}

function init() {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
    initPlayerScroll();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

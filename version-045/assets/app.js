(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".mobile-toggle");

        if (header && toggle) {
            toggle.addEventListener("click", function () {
                var open = header.classList.toggle("nav-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        if (slides.length) {
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showSlide(i);
                });
            });
            setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        var filterInput = document.querySelector(".js-filter-input");
        var filterTargets = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));

        function applyFilter(value) {
            var keyword = String(value || "").trim().toLowerCase();
            filterTargets.forEach(function (item) {
                var text = String(item.getAttribute("data-search") || "").toLowerCase();
                item.classList.toggle("hidden-by-filter", keyword && text.indexOf(keyword) === -1);
            });
        }

        if (filterInput && filterTargets.length) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (q) {
                filterInput.value = q;
                applyFilter(q);
            }
            filterInput.addEventListener("input", function () {
                applyFilter(filterInput.value);
            });
        }
    });

    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector(".movie-video");
        var overlay = document.querySelector(".play-overlay");
        var hasStarted = false;
        var hlsInstance = null;

        function start() {
            if (!video || !streamUrl) {
                return;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            if (!hasStarted) {
                hasStarted = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("ended", function () {
                if (hlsInstance) {
                    hlsInstance.stopLoad();
                }
            });
        }
    };
})();

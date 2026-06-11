(function () {
  const mobileButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    const section = rail.closest('.content-section');
    if (!section) return;
    const left = section.querySelector('[data-scroll-left]');
    const right = section.querySelector('[data-scroll-right]');
    if (left) left.addEventListener('click', function () { rail.scrollBy({ left: -420, behavior: 'smooth' }); });
    if (right) right.addEventListener('click', function () { rail.scrollBy({ left: 420, behavior: 'smooth' }); });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) { slide.classList.toggle('active', idx === current); });
      dots.forEach(function (dot, idx) { dot.classList.toggle('active', idx === current); });
    }
    if (prev) prev.addEventListener('click', function () { show(current - 1); });
    if (next) next.addEventListener('click', function () { show(current + 1); });
    dots.forEach(function (dot, idx) { dot.addEventListener('click', function () { show(idx); }); });
    window.setInterval(function () { show(current + 1); }, 5000);
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const input = panel.querySelector('[data-card-search]');
    const scope = panel.closest('section') || document;
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const empty = scope.querySelector('[data-empty-state]');
    const buttons = Array.from(panel.querySelectorAll('[data-filter-value]'));
    let active = '全部';
    function apply() {
      const query = input ? input.value.trim().toLowerCase() : '';
      let shown = 0;
      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const genre = card.getAttribute('data-genre') || '';
        const okQuery = !query || text.indexOf(query) !== -1;
        const okFilter = active === '全部' || genre.indexOf(active) !== -1 || text.indexOf(active.toLowerCase()) !== -1;
        const visible = okQuery && okFilter;
        card.style.display = visible ? '' : 'none';
        if (visible) shown += 1;
      });
      if (empty) empty.classList.toggle('show', shown === 0);
    }
    if (input) input.addEventListener('input', apply);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.getAttribute('data-filter-value') || '全部';
        buttons.forEach(function (item) { item.classList.toggle('active', item === button); });
        apply();
      });
    });
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && input) input.value = q;
    if (buttons[0]) buttons[0].classList.add('active');
    apply();
  });

  document.querySelectorAll('.js-player').forEach(function (frame) {
    const video = frame.querySelector('video');
    const button = frame.querySelector('.play-layer');
    const stream = frame.getAttribute('data-stream');
    let attached = false;
    function attach() {
      if (attached || !video || !stream) return;
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        frame._hls = hls;
      } else {
        video.src = stream;
      }
    }
    function play() {
      attach();
      frame.classList.add('ready');
      const started = video.play();
      if (started && typeof started.catch === 'function') started.catch(function () {});
    }
    if (button) button.addEventListener('click', play);
    if (video) video.addEventListener('click', function () {
      if (!attached || video.paused) play();
    });
  });
})();

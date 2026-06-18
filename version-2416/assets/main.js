(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
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

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 6200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
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

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var searchInputs = document.querySelectorAll('[data-search-input]');
    var searchTitle = document.querySelector('[data-search-title]');
    var searchSummary = document.querySelector('[data-search-summary]');
    var searchCards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var emptyState = document.querySelector('[data-search-empty]');

    searchInputs.forEach(function (input) {
      input.value = query;
    });

    if (searchCards.length) {
      var normalizedQuery = query.toLowerCase();
      var visible = 0;

      searchCards.forEach(function (card) {
        var text = card.getAttribute('data-search-text') || '';
        var match = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      if (searchTitle) {
        searchTitle.textContent = query ? '搜索：' + query : '搜索视频';
      }

      if (searchSummary) {
        searchSummary.textContent = query ? '找到 ' + visible + ' 部相关内容' : '浏览片库内容';
      }

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }
  });
})();

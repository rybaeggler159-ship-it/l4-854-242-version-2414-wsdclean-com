(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    var search = document.querySelector('.nav-search');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
        if (search) {
          search.classList.toggle('is-open');
        }
      });
    }

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.removeAttribute('src');
      });
    });

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
        }, 5200);
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

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var region = scope.querySelector('[data-filter-region]');
      var year = scope.querySelector('[data-filter-year]');
      var grid = scope.parentElement ? scope.parentElement.querySelector('[data-card-grid]') : null;
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      if (input && input.hasAttribute('data-query-input')) {
        input.value = query;
      }

      if (region && region.options.length <= 1) {
        var regions = [];
        cards.forEach(function (card) {
          var value = card.getAttribute('data-region');
          if (value && regions.indexOf(value) === -1) {
            regions.push(value);
          }
        });
        regions.sort().forEach(function (value) {
          var option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          region.appendChild(option);
        });
      }

      if (year && year.options.length <= 1) {
        var years = [];
        cards.forEach(function (card) {
          var value = card.getAttribute('data-year');
          if (value && years.indexOf(value) === -1) {
            years.push(value);
          }
        });
        years.sort().reverse().slice(0, 40).forEach(function (value) {
          var option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          year.appendChild(option);
        });
      }

      function applyFilter() {
        var term = normalize(input ? input.value : '');
        var regionValue = normalize(region ? region.value : '');
        var yearValue = normalize(year ? year.value : '');

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var matchesTerm = !term || haystack.indexOf(term) !== -1;
          var matchesRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
          var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
          card.classList.toggle('is-hidden', !(matchesTerm && matchesRegion && matchesYear));
        });
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (region) {
        region.addEventListener('change', applyFilter);
      }
      if (year) {
        year.addEventListener('change', applyFilter);
      }
      applyFilter();
    });
  });
})();

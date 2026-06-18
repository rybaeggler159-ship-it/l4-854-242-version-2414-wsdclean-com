(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prevButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  if (slides.length) {
    showHero(0);
    startHero();
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showHero(heroIndex - 1);
        startHero();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showHero(heroIndex + 1);
        startHero();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
        startHero();
      });
    });
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var pageSearch = document.querySelector('[data-page-search]');
  var emptyState = document.querySelector('[data-empty-state]');
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

  function clean(value) {
    return String(value || '').trim().toLowerCase();
  }

  function fillSelect(select) {
    var key = select.getAttribute('data-filter');
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute('data-' + key);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }
    var keyword = clean(pageSearch ? pageSearch.value : '');
    var activeFilters = {};
    filterSelects.forEach(function (select) {
      activeFilters[select.getAttribute('data-filter')] = select.value;
    });
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = clean([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var filterMatch = Object.keys(activeFilters).every(function (key) {
        return !activeFilters[key] || card.getAttribute('data-' + key) === activeFilters[key];
      });
      var shouldShow = keywordMatch && filterMatch;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (cards.length) {
    filterSelects.forEach(fillSelect);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (pageSearch && query) {
      pageSearch.value = query;
    }
    if (pageSearch) {
      pageSearch.addEventListener('input', filterCards);
    }
    filterSelects.forEach(function (select) {
      select.addEventListener('change', filterCards);
    });
    filterCards();
  }
})();

(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  var navSearch = document.querySelector('.nav-search');

  if (menuButton && nav && navSearch) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
      navSearch.classList.toggle('open');
      document.body.classList.toggle('no-scroll');
    });
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterYear = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var empty = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput && filterInput.value);
    var region = normalize(filterRegion && filterRegion.value);
    var type = normalize(filterType && filterType.value);
    var year = normalize(filterYear && filterYear.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var ok = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        ok = false;
      }

      if (region && normalize(card.getAttribute('data-region')) !== region) {
        ok = false;
      }

      if (type && normalize(card.getAttribute('data-type')) !== type) {
        ok = false;
      }

      if (year && normalize(card.getAttribute('data-year')) !== year) {
        ok = false;
      }

      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  [filterInput, filterRegion, filterType, filterYear].forEach(function (node) {
    if (node) {
      node.addEventListener('input', applyFilters);
      node.addEventListener('change', applyFilters);
    }
  });
})();

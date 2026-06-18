(function () {
  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function yearMatches(cardYear, selected) {
    if (!selected) {
      return true;
    }
    var year = parseInt(cardYear, 10);
    if (selected === "2010") {
      return year >= 2010 && year <= 2019;
    }
    if (selected === "2000") {
      return year >= 2000 && year <= 2009;
    }
    if (selected === "1990") {
      return !year || year < 2000;
    }
    return cardYear === selected;
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-card-grid]"));
    grids.forEach(function (grid) {
      var scope = grid.closest("[data-filter-scope]") || document;
      var input = scope.querySelector("[data-search-input]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var empty = scope.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function apply() {
        var query = normalize(input ? input.value : "");
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var shown = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var ok = (!query || text.indexOf(query) !== -1) && (!type || cardType === type) && yearMatches(cardYear, year);
          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
        }
      }
      apply();
    });
  }

  function setupAnchorSearch() {
    var input = document.querySelector("[data-home-search]");
    var form = document.querySelector("[data-home-search-form]");
    if (!input || !form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      window.location.href = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupAnchorSearch();
  });
})();

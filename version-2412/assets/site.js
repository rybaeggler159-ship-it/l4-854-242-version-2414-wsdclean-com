(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
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

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
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

  function bindFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var category = scope.querySelector("[data-filter-category]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var count = scope.querySelector("[data-result-count]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

      function matchSelect(card, select, name) {
        if (!select || !select.value) {
          return true;
        }
        return normalize(card.getAttribute("data-" + name)) === normalize(select.value);
      }

      function update() {
        var keyword = normalize(input ? input.value : "");
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var visible = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            visible = false;
          }
          if (!matchSelect(card, category, "category")) {
            visible = false;
          }
          if (!matchSelect(card, region, "region")) {
            visible = false;
          }
          if (!matchSelect(card, type, "type")) {
            visible = false;
          }
          if (!matchSelect(card, year, "year")) {
            visible = false;
          }
          card.hidden = !visible;
          card.classList.toggle("is-hidden", !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (count) {
          count.textContent = "当前显示 " + shown + " 部";
        }
      }

      [input, category, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });
      update();
    });
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindFilters();
  });
})();

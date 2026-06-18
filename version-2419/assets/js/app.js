(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMobileNav() {
    var toggle = $('[data-mobile-toggle]');
    var nav = $('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
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
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  }

  function uniqueOptions(cards, key) {
    var set = new Set();

    cards.forEach(function (card) {
      var value = card.getAttribute(key);
      if (value) {
        set.add(value);
      }
    });

    return Array.from(set).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, options) {
    if (!select) {
      return;
    }

    options.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var panel = $('[data-filter-panel]');
    var grid = $('[data-filter-grid]');

    if (!panel || !grid) {
      return;
    }

    var cards = $all('[data-movie-card]', grid);
    var input = $('[data-filter-input]', panel);
    var region = $('[data-filter-region]', panel);
    var year = $('[data-filter-year]', panel);
    var type = $('[data-filter-type]', panel);
    var count = $('[data-filter-count]', panel);

    fillSelect(region, uniqueOptions(cards, 'data-region'));
    fillSelect(year, uniqueOptions(cards, 'data-year'));
    fillSelect(type, uniqueOptions(cards, 'data-type'));

    function apply() {
      var query = normalize(input && input.value);
      var regionValue = region && region.value;
      var yearValue = year && year.value;
      var typeValue = type && type.value;
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' '));

        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          matched = false;
        }

        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          matched = false;
        }

        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
      }
    }

    [input, region, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupSearchPage() {
    var page = $('[data-search-page]');

    if (!page) {
      return;
    }

    var input = $('[data-site-search]', page);
    var button = $('[data-site-search-button]', page);
    var results = $('[data-search-results]', page);
    var count = $('[data-search-count]', page);
    var fallback = $('[data-search-fallback]', page);
    var src = page.getAttribute('data-search-src');
    var indexData = [];

    function cardTemplate(movie) {
      return [
        '<a class="movie-card card card-hover" href="' + escapeHtml(movie.url) + '">',
        '  <span class="movie-poster">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="rating-badge">★ ' + escapeHtml(movie.rating) + '</span>',
        '    <span class="category-badge">' + escapeHtml(movie.category) + '</span>',
        '  </span>',
        '  <span class="movie-body">',
        '    <strong>' + escapeHtml(movie.title) + '</strong>',
        '    <em>' + escapeHtml(movie.oneLine) + '</em>',
        '    <span class="movie-meta">',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.duration) + '</span>',
        '    </span>',
        '  </span>',
        '</a>'
      ].join('');
    }

    function runSearch() {
      var query = normalize(input && input.value);

      if (!query) {
        results.innerHTML = '';
        if (fallback) {
          fallback.style.display = '';
        }
        if (count) {
          count.textContent = '推荐内容';
        }
        return;
      }

      var matches = indexData.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.category,
          movie.tags,
          movie.oneLine
        ].join(' ')).indexOf(query) !== -1;
      }).slice(0, 200);

      if (fallback) {
        fallback.style.display = 'none';
      }

      results.innerHTML = matches.map(cardTemplate).join('');

      if (count) {
        count.textContent = '找到 ' + matches.length + ' 条相关结果';
      }
    }

    window.fetch(src)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        indexData = Array.isArray(data) ? data : [];
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
          input.value = q;
          runSearch();
        }
      })
      .catch(function () {
        if (count) {
          count.textContent = '搜索索引加载失败，请使用分类页筛选。';
        }
      });

    if (button) {
      button.addEventListener('click', runSearch);
    }

    if (input) {
      input.addEventListener('input', runSearch);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          runSearch();
        }
      });
    }
  }

  function setupPlayer() {
    $all('[data-player]').forEach(function (shell) {
      var video = $('video[data-src]', shell);
      var cover = $('[data-play-cover]', shell);
      var status = $('[data-player-status]', shell);
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function loadAndPlay() {
        if (!video) {
          return;
        }

        var source = video.getAttribute('data-src');

        if (!video.dataset.ready) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            setStatus('正在使用浏览器原生 HLS 播放。');
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            setStatus('HLS.js 已初始化，正在加载播放源。');
          } else {
            video.src = source;
            setStatus('当前浏览器不支持 HLS.js，已尝试直接加载播放源。');
          }

          video.dataset.ready = '1';
        }

        shell.classList.add('is-ready');
        video.controls = true;
        video.play().catch(function () {
          setStatus('播放已准备好，请再次点击播放器开始播放。');
        });
      }

      if (cover) {
        cover.addEventListener('click', loadAndPlay);
      }

      shell.addEventListener('click', function (event) {
        if (event.target === video && !video.dataset.ready) {
          loadAndPlay();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayer();
  });
})();

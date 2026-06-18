(function () {
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var input = document.querySelector('[data-search-page-input]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');
  var data = window.MovieSearchData || [];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function card(movie) {
    return [
      '<a class="poster-card" href="' + escapeHtml(movie.url) + '">',
      '  <span class="poster-thumb">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-overlay"><span>立即播放</span></span>',
      '    <span class="corner-label">' + escapeHtml(movie.region) + '</span>',
      '    <span class="year-label">' + escapeHtml(movie.year) + '</span>',
      '  </span>',
      '  <span class="poster-info">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <span>' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</span>',
      '    <em>' + escapeHtml(movie.oneLine) + '</em>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function render(value) {
    if (!results) {
      return;
    }

    var keyword = normalize(value);
    var matches = data.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' '));
      return !keyword || haystack.indexOf(keyword) !== -1;
    }).slice(0, 120);

    results.innerHTML = matches.map(card).join('');

    if (empty) {
      empty.classList.toggle('show', matches.length === 0);
    }
  }

  if (input) {
    input.value = query;
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  render(query);
})();

(() => {
  const movieCards = [...document.querySelectorAll('.movie-card')];
  const dateButtons = [...document.querySelectorAll('.date-button')];
  const languageButtons = [...document.querySelectorAll('[data-language]')];
  const timeFilterButtons = [...document.querySelectorAll('.time-filter [data-time]')];
  const searchInput = document.getElementById('movie-search');
  const findButton = document.getElementById('find-showtimes-button');
  const movieCount = document.getElementById('movie-count');
  const searchFeedback = document.getElementById('search-feedback');
  const moreButton = document.getElementById('toy-story-more-button');
  const extraShowtimes = document.getElementById('toy-story-extra-showtimes');

  if (!movieCards.length) return;

  let selectedDate = 'any';
  let selectedLanguage = 'all';
  let selectedTimeFilter = 'any';

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const timeBucket = (label) => {
    const match = String(label).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 'any';
    let hour = Number(match[1]);
    const suffix = match[3].toUpperCase();
    if (suffix === 'PM' && hour !== 12) hour += 12;
    if (suffix === 'AM' && hour === 12) hour = 0;
    return hour < 12 ? 'morning' : 'evening';
  };

  const setActive = (buttons, activeButton) => {
    buttons.forEach((button) => {
      const active = button === activeButton;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  dateButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      selectedDate = button.dataset.date || 'any';
      setActive(dateButtons, button);
    });
  });

  languageButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      selectedLanguage = button.dataset.language || 'all';
      setActive(languageButtons, button);
    });
  });

  timeFilterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      selectedTimeFilter = button.dataset.time || 'any';
      setActive(timeFilterButtons, button);
    });
  });

  const clearCardFeedback = (card) => {
    const feedback = card.querySelector('.movie-card-feedback');
    if (feedback) feedback.remove();
  };

  const showCardFeedback = (card, message) => {
    clearCardFeedback(card);
    const feedback = document.createElement('p');
    feedback.className = 'movie-card-feedback';
    feedback.setAttribute('role', 'status');
    feedback.textContent = message;
    card.appendChild(feedback);
  };

  movieCards.forEach((card) => {
    const showtimeButtons = [...card.querySelectorAll('.showtime-button')];

    showtimeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        showtimeButtons.forEach((other) => {
          const isSelected = other === button;
          other.classList.toggle('selected', isSelected);
          other.setAttribute('aria-pressed', String(isSelected));
        });
        card.dataset.selectedTime = button.dataset.time || button.textContent.trim();
        card.dataset.selectedDate = button.dataset.date || '';
        clearCardFeedback(card);
      });
    });

    const bookButton = card.querySelector('.book-button');
    if (bookButton) {
      bookButton.addEventListener('click', (event) => {
        event.preventDefault();

        const selectedShowtime = card.querySelector('.showtime-button.selected');
        if (!selectedShowtime) {
          showCardFeedback(card, 'Please select a showtime before continuing.');
          const firstShowtime = card.querySelector('.showtime-button:not([hidden])');
          if (firstShowtime) firstShowtime.focus();
          return;
        }

        const movieId = card.dataset.movieId;
        const showtime = selectedShowtime.dataset.time || selectedShowtime.textContent.trim();

        let date = selectedDate;
        if (date === 'any') {
          date = selectedShowtime.dataset.date || card.dataset.selectedDate || card.dataset.defaultDate || '2026-07-04';
        }

        const params = new URLSearchParams({
          movie: movieId,
          date,
          time: showtime
        });

        window.location.href = `seat-selection.html?${params.toString()}`;
      });
    }
  });

  if (moreButton && extraShowtimes) {
    moreButton.addEventListener('click', () => {
      const willOpen = extraShowtimes.hidden;
      extraShowtimes.hidden = !willOpen;
      moreButton.setAttribute('aria-expanded', String(willOpen));
      moreButton.textContent = willOpen ? 'Show less' : '+5 more';
    });
  }

  const applyFilters = () => {
    const query = normalize(searchInput?.value);
    let visibleMovies = 0;

    movieCards.forEach((card) => {
      const titleMatches = !query || normalize(card.dataset.movie).includes(query) || normalize(card.dataset.title).includes(query);
      const languageMatches = selectedLanguage === 'all' || card.dataset.language === selectedLanguage;

      const showtimeButtons = [...card.querySelectorAll('.showtime-button')];
      let visibleShowtimes = 0;

      showtimeButtons.forEach((button) => {
        const matchesTime = selectedTimeFilter === 'any' || timeBucket(button.dataset.time || button.textContent) === selectedTimeFilter;
        button.hidden = !matchesTime;

        if (!matchesTime && button.classList.contains('selected')) {
          button.classList.remove('selected');
          button.setAttribute('aria-pressed', 'false');
          card.dataset.selectedTime = '';
          card.dataset.selectedDate = '';
        }

        if (matchesTime) visibleShowtimes += 1;
      });

      const timeMatches = selectedTimeFilter === 'any' || visibleShowtimes > 0;
      const visible = titleMatches && languageMatches && timeMatches;
      card.hidden = !visible;

      if (visible) visibleMovies += 1;
    });

    if (movieCount) {
      movieCount.textContent = `${visibleMovies} ${visibleMovies === 1 ? 'movie' : 'movies'} found`;
    }

    if (searchFeedback) {
      if (visibleMovies === 0) {
        searchFeedback.textContent = 'No matching movies found. Try changing the movie name, language or time filter.';
      } else if (selectedDate !== 'any') {
        const activeDate = dateButtons.find((button) => button.dataset.date === selectedDate);
        const label = activeDate ? activeDate.innerText.replace(/\s+/g, ' ').trim() : selectedDate;
        searchFeedback.textContent = `Showing available sessions for ${label}.`;
      } else {
        searchFeedback.textContent = '';
      }
    }
  };

  findButton?.addEventListener('click', applyFilters);
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applyFilters();
  });

  movieCount.textContent = `${movieCards.length} movies found`;
})();
(() => {
  const DRAFT_KEY = 'newportBookingDraft';

  const MOVIES = {
    ufo: {
      title: 'Unidentified Murder',
      poster: 'assets/images/movie-ufo.png',
      house: 'House 3',
      language: 'Cantonese (Chinese Subtitles)'
    },
    minions: {
      title: 'Minions & Monsters (Chi)',
      poster: 'assets/images/movie-minions.png',
      house: 'House 2',
      language: 'Cantonese (Chinese Subtitles)'
    },
    'toy-story-5': {
      title: 'Toy Story 5 (Chi)',
      poster: 'assets/images/movie-toy-story-5.png',
      house: 'House 1',
      language: 'Cantonese (Chinese Subtitles)'
    }
  };

  const STATUS_PROFILES = [
    {
      sold: ['C3', 'D9', 'E7', 'E8', 'J2', 'K11', 'M5'],
      processing: ['E9', 'E10', 'H4', 'N8']
    },
    {
      sold: ['B4', 'D5', 'D6', 'G10', 'J3', 'L8', 'N11'],
      processing: ['C8', 'H9', 'K4']
    },
    {
      sold: ['A10', 'C2', 'F5', 'F6', 'I9', 'M3', 'N7'],
      processing: ['D10', 'J8', 'L4']
    },
    {
      sold: ['B9', 'E3', 'H5', 'H6', 'K10', 'M8', 'N2'],
      processing: ['C4', 'G9', 'L11']
    }
  ];

  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('movie') || 'minions';
  const sessionMovie = MOVIES[movieId] || MOVIES.minions;
  const sessionDate = params.get('date') || '2026-07-09';
  const sessionTime = params.get('time') || '9:30 PM';

  const poster = document.getElementById('selected-movie-poster');
  const title = document.getElementById('selected-movie-title');
  const cinema = document.getElementById('selected-cinema');
  const showtime = document.getElementById('selected-showtime');
  const language = document.getElementById('selected-language');

  const seatButtons = [...document.querySelectorAll('.seat')];
  const selectedSeatList = document.getElementById('selected-seat-list');
  const selectionEmpty = document.getElementById('selection-empty');
  const ticketCount = document.getElementById('ticket-count');
  const confirmButton = document.getElementById('confirm-seats-button');
  const feedback = document.getElementById('selection-feedback');
  const progressSteps = [...document.querySelectorAll('.progress-step')];

  let selectedSeats = [];

  const formatDate = (isoDate) => {
    const date = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return isoDate;
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()} (${weekday})`;
  };

  poster.src = sessionMovie.poster;
  poster.alt = `${sessionMovie.title} poster`;
  title.textContent = sessionMovie.title;
  cinema.textContent = `Cinema: Hyland (TM) · ${sessionMovie.house}`;
  showtime.textContent = `${formatDate(sessionDate)} · ${sessionTime}`;
  language.textContent = sessionMovie.language;
  document.title = `${sessionMovie.title} | Seat Selection`;

  const sessionKey = `${movieId}|${sessionDate}|${sessionTime}`;
  const hash = [...sessionKey].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 0);
  let profileIndex = hash % STATUS_PROFILES.length;

  // Session-specific seat state for Minions at 9:30 PM.
  if (movieId === 'minions' && sessionTime === '9:30 PM') profileIndex = 0;

  const profile = STATUS_PROFILES[profileIndex];
  const sold = new Set(profile.sold);
  const processing = new Set(profile.processing);

  const setFeedback = (message, type = 'info') => {
    if (!feedback) return;
    feedback.hidden = !message;
    feedback.textContent = message || '';
    feedback.dataset.type = type;
  };

  const baseStatusForSeat = (seat) => {
    if (seat.classList.contains('seat-wheelchair')) return 'wheelchair';
    return 'available';
  };

  const applySessionAvailability = () => {
    seatButtons.forEach((seat) => {
      const seatId = seat.dataset.seat;
      const baseStatus = seat.classList.contains('seat-wheelchair') ? 'wheelchair' : 'available';

      seat.dataset.baseStatus = baseStatus;
      seat.classList.remove('seat-available', 'seat-sold', 'seat-processing', 'seat-selected', 'seat-wheelchair');

      if (sold.has(seatId) && baseStatus !== 'wheelchair') {
        seat.dataset.status = 'sold';
        seat.classList.add('seat-sold');
        seat.disabled = true;
        seat.setAttribute('aria-label', `Seat ${seatId}, sold`);
        seat.title = 'Sold';
      } else if (processing.has(seatId) && baseStatus !== 'wheelchair') {
        seat.dataset.status = 'processing';
        seat.classList.add('seat-processing');
        seat.disabled = true;
        seat.setAttribute('aria-label', `Seat ${seatId}, processing`);
        seat.title = 'Temporarily unavailable';
      } else {
        seat.dataset.status = baseStatus;
        seat.classList.add(baseStatus === 'wheelchair' ? 'seat-wheelchair' : 'seat-available');
        seat.disabled = false;
        seat.title = baseStatus === 'wheelchair' ? 'Wheelchair space' : 'Available';
        seat.setAttribute('aria-label', `Seat ${seatId}, ${baseStatus === 'wheelchair' ? 'wheelchair space' : 'available'}`);
      }
    });
  };

  const seatParts = (seatId) => {
    const match = /^([A-P])(\d+)$/.exec(seatId);
    return match ? { row: match[1], number: Number(match[2]) } : null;
  };

  const sortSeatIds = (ids) => {
    return [...ids].sort((a, b) => {
      const pa = seatParts(a);
      const pb = seatParts(b);
      if (!pa || !pb) return a.localeCompare(b);
      if (pa.row !== pb.row) return pa.row.localeCompare(pb.row);
      return pa.number - pb.number;
    });
  };

  const sameRowAndConsecutive = (ids) => {
    if (ids.length <= 1) return true;
    const parts = ids.map(seatParts);
    const row = parts[0].row;
    if (parts.some((part) => !part || part.row !== row)) return false;
    const nums = parts.map((part) => part.number).sort((a, b) => a - b);
    return nums.every((num, index) => index === 0 || num === nums[index - 1] + 1);
  };

  const createsIsolatedSingleSeat = (ids) => {
    const selected = new Set(ids);
    const occupied = new Set([...sold, ...processing, ...selected]);

    const rows = 'ABCDEFGHIJKLMNOP'.split('');
    const blocks = [
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12]
    ];

    for (const row of rows) {
      for (const block of blocks) {
        for (let i = 1; i < block.length - 1; i += 1) {
          const current = `${row}${block[i]}`;
          const left = `${row}${block[i - 1]}`;
          const right = `${row}${block[i + 1]}`;

          const currentSeat = document.querySelector(`[data-seat="${current}"]`);
          if (!currentSeat || currentSeat.dataset.baseStatus === 'wheelchair') continue;

          const currentIsAvailable = !occupied.has(current);
          if (currentIsAvailable && occupied.has(left) && occupied.has(right)) {
            return current;
          }
        }
      }
    }
    return null;
  };

  const renderSelection = () => {
    selectedSeats = sortSeatIds(selectedSeats);

    if (selectionEmpty) selectionEmpty.hidden = selectedSeats.length > 0;
    if (ticketCount) ticketCount.textContent = String(selectedSeats.length);

    if (selectedSeatList) {
      selectedSeatList.innerHTML = '';
      selectedSeats.forEach((seatId) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'selected-seat-chip';
        chip.dataset.removeSeat = seatId;
        chip.setAttribute('aria-label', `Remove seat ${seatId}`);
        chip.innerHTML = `<span>${seatId}</span><span aria-hidden="true">×</span>`;
        selectedSeatList.appendChild(chip);
      });
    }

    if (confirmButton) {
      confirmButton.disabled = selectedSeats.length === 0;
      confirmButton.textContent = 'Confirm seats';
    }
  };

  const updateSeatVisual = (seatId, selected) => {
    const seat = document.querySelector(`[data-seat="${seatId}"]`);
    if (!seat) return;

    const baseStatus = seat.dataset.baseStatus || 'available';

    if (selected) {
      seat.dataset.status = 'selected';
      seat.classList.remove('seat-available', 'seat-wheelchair');
      seat.classList.add('seat-selected');
      seat.setAttribute('aria-pressed', 'true');
      seat.setAttribute('aria-label', `Seat ${seatId}, selected`);
      seat.title = 'Selected';
    } else {
      seat.dataset.status = baseStatus;
      seat.classList.remove('seat-selected');
      seat.classList.add(baseStatus === 'wheelchair' ? 'seat-wheelchair' : 'seat-available');
      seat.setAttribute('aria-pressed', 'false');
      seat.setAttribute('aria-label', `Seat ${seatId}, ${baseStatus === 'wheelchair' ? 'wheelchair space' : 'available'}`);
      seat.title = baseStatus === 'wheelchair' ? 'Wheelchair space' : 'Available';
    }
  };

  const trySelectSeat = (seatId) => {

    if (selectedSeats.length >= 8) {
      setFeedback('You can select a maximum of 8 seats in one transaction.', 'error');
      return;
    }

    const candidate = [...selectedSeats, seatId];

    if (!sameRowAndConsecutive(candidate)) {
      setFeedback('Please choose seats in the same row and in consecutive order.', 'error');
      return;
    }

    const isolated = createsIsolatedSingleSeat(candidate);
    if (isolated) {
      setFeedback(`That choice would leave seat ${isolated} isolated. Please choose a neighbouring seat instead.`, 'error');
      return;
    }

    selectedSeats = candidate;
    updateSeatVisual(seatId, true);
    setFeedback(`${seatId} selected.`, 'success');
    renderSelection();
  };

  const tryDeselectSeat = (seatId) => {

    const candidate = selectedSeats.filter((id) => id !== seatId);

    if (!sameRowAndConsecutive(candidate)) {
      setFeedback('Remove a seat from either end of your selected group to keep the seats consecutive.', 'error');
      return;
    }

    selectedSeats = candidate;
    updateSeatVisual(seatId, false);
    setFeedback(`${seatId} removed.`, 'info');
    renderSelection();
  };

  applySessionAvailability();

  // Restore the current seat selection when the user returns from the
  // next booking step for the same movie session.
  try {
    const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    const sameSession = savedDraft &&
      savedDraft.movieId === movieId &&
      savedDraft.dateISO === sessionDate &&
      savedDraft.time === sessionTime;

    if (sameSession && Array.isArray(savedDraft.seats)) {
      const restorable = savedDraft.seats.filter((seatId) => {
        const seat = document.querySelector(`[data-seat="${seatId}"]`);
        return seat && !seat.disabled && (seat.dataset.status === 'available' || seat.dataset.status === 'wheelchair');
      });

      if (sameRowAndConsecutive(restorable) && !createsIsolatedSingleSeat(restorable)) {
        selectedSeats = sortSeatIds(restorable);
        selectedSeats.forEach((seatId) => updateSeatVisual(seatId, true));
      }
    }
  } catch (error) {
    console.warn('Unable to restore booking draft.', error);
  }

  seatButtons.forEach((seat) => {
    const selectable = seat.dataset.status === 'available' || seat.dataset.status === 'wheelchair';
    if (selectable) {
      seat.setAttribute('aria-pressed', 'false');
      seat.addEventListener('click', () => {
        const seatId = seat.dataset.seat;
        if (selectedSeats.includes(seatId)) {
          tryDeselectSeat(seatId);
        } else {
          trySelectSeat(seatId);
        }
      });
    }
  });

  selectedSeatList?.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-remove-seat]');
    if (!chip) return;
    tryDeselectSeat(chip.dataset.removeSeat);
  });

  confirmButton?.addEventListener('click', () => {
    if (!selectedSeats.length) return;

    const isolated = createsIsolatedSingleSeat(selectedSeats);
    if (isolated) {
      setFeedback(`Seat ${isolated} would be left isolated. Please adjust your selection before continuing.`, 'error');
      return;
    }

    const draft = {
      movieId,
      title: sessionMovie.title,
      poster: sessionMovie.poster,
      cinema: 'Hyland (TM)',
      house: sessionMovie.house,
      dateISO: sessionDate,
      dateDisplay: formatDate(sessionDate),
      time: sessionTime,
      language: sessionMovie.language,
      seats: sortSeatIds(selectedSeats),
      seatCount: selectedSeats.length
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setFeedback(`Seats ${selectedSeats.join(', ')} confirmed. Continue to choose ticket type.`, 'success');
      window.location.href = 'ticket-type.html';
    } catch (error) {
      console.warn('Unable to save booking draft.', error);
      setFeedback('The booking could not continue. Please try again.', 'error');
    }
  });

  renderSelection();
})();
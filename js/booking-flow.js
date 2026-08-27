(() => {
  "use strict";

  const DRAFT_KEY = "newportBookingDraft";
  const HISTORY_KEY = "newportBookingHistory";
  const LAST_BOOKING_KEY = "newportLastBooking";
  const SERVICE_CHARGE = 6;

  const TICKET_TYPES = {
    adult: { label: "Adult", price: 50 },
    student: { label: "Student", price: 45 },
    child: { label: "Child", price: 45 },
    senior: { label: "Senior", price: 45 }
  };

  const readJSON = (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn(`Unable to read ${key}`, error);
      return fallback;
    }
  };

  const writeJSON = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Unable to write ${key}`, error);
      return false;
    }
  };

  const createCardFingerprint = async (cardDigits) => {
    const normalized = String(cardDigits || "").replace(/\D/g, "");

    if (window.crypto?.subtle && window.TextEncoder) {
      const data = new TextEncoder().encode(normalized);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }

    // Fallback for browsers without SubtleCrypto. This is only an
    // identifier for the local UI flow; the card number itself is not saved.
    let hash = 2166136261;
    for (const character of normalized) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return `local-${(hash >>> 0).toString(16)}`;
  };

  const getDraft = () => readJSON(DRAFT_KEY, null);
  const saveDraft = (draft) => writeJSON(DRAFT_KEY, draft);

  const getHistory = () => {
    const history = readJSON(HISTORY_KEY, []);
    return Array.isArray(history) ? history : [];
  };

  const escapeHTML = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatMoney = (amount) => `HK$${Number(amount || 0).toFixed(0)}`;

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return isoDate;
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()} (${weekday})`;
  };

  const showFeedback = (message, type = "error") => {
    const feedback = document.getElementById("flow-feedback");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.hidden = !message;
    feedback.dataset.type = type;
  };

  const clearFeedback = () => {
    const feedback = document.getElementById("flow-feedback");
    if (!feedback) return;
    feedback.textContent = "";
    feedback.hidden = true;
    feedback.removeAttribute("data-type");
  };

  const missingDraft = () => {
    const container = document.querySelector(".booking-flow-container");
    if (!container) return;
    container.innerHTML = `
      <section class="flow-missing-state">
        <h1>No booking is currently in progress</h1>
        <p>Choose a movie session and seats before continuing to ticket and payment details.</p>
        <a class="flow-primary-button" href="index.html">Return to Home</a>
      </section>
    `;
  };

  const populateSession = (draft) => {
    const poster = document.getElementById("flow-movie-poster");
    const title = document.getElementById("flow-movie-title");
    const cinema = document.getElementById("flow-cinema");
    const showtime = document.getElementById("flow-showtime");
    const seats = document.getElementById("flow-seats");

    if (poster) {
      poster.src = draft.poster || "assets/images/movie-minions.png";
      poster.alt = `${draft.title || "Selected movie"} poster`;
    }
    if (title) title.textContent = draft.title || "Selected movie";
    if (cinema) cinema.textContent = `${draft.cinema || "Hyland (TM)"} · ${draft.house || ""}`.replace(/ · $/, "");
    if (showtime) showtime.textContent = `${draft.dateDisplay || formatDate(draft.dateISO)} · ${draft.time || ""}`.replace(/ · $/, "");
    if (seats) seats.textContent = Array.isArray(draft.seats) && draft.seats.length ? draft.seats.join(", ") : "—";
  };

  const ticketCountFromDraft = (draft) => Array.isArray(draft?.seats) ? draft.seats.length : 0;

  const ticketBreakdown = (ticketTypes = {}) => {
    return Object.entries(TICKET_TYPES)
      .map(([key, config]) => ({
        key,
        label: config.label,
        price: config.price,
        quantity: Number(ticketTypes[key] || 0)
      }))
      .filter((item) => item.quantity > 0);
  };

  const calculateTicketTotal = (ticketTypes = {}) => {
    return ticketBreakdown(ticketTypes).reduce(
      (sum, item) => sum + ((item.price + SERVICE_CHARGE) * item.quantity),
      0
    );
  };

  const renderTicketSummary = (list, ticketTypes) => {
    if (!list) return;
    const breakdown = ticketBreakdown(ticketTypes);
    list.innerHTML = breakdown.length
      ? breakdown.map((item) => `
          <li>
            <span>${escapeHTML(item.label)} × ${item.quantity}</span>
            <strong>${formatMoney((item.price + SERVICE_CHARGE) * item.quantity)}</strong>
          </li>
        `).join("")
      : '<li><span>No tickets selected</span><strong>HK$0</strong></li>';
  };

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  /* ==========================================================
     TICKET TYPE
  ========================================================== */
  const initTicketType = () => {
    const draft = getDraft();
    if (!draft || ticketCountFromDraft(draft) === 0) {
      missingDraft();
      return;
    }

    populateSession(draft);

    const seatCount = ticketCountFromDraft(draft);
    const selects = {
      adult: document.getElementById("ticket-adult"),
      student: document.getElementById("ticket-student"),
      child: document.getElementById("ticket-child"),
      senior: document.getElementById("ticket-senior")
    };

    Object.values(selects).forEach((select) => {
      if (!select) return;
      select.innerHTML = Array.from({ length: seatCount + 1 }, (_, index) => `<option value="${index}">${index}</option>`).join("");
    });

    const previous = draft.ticketTypes || {};
    const hasPrevious = Object.values(previous).some((value) => Number(value) > 0);
    selects.adult.value = String(hasPrevious ? Number(previous.adult || 0) : seatCount);
    selects.student.value = String(Number(previous.student || 0));
    selects.child.value = String(Number(previous.child || 0));
    selects.senior.value = String(Number(previous.senior || 0));

    const summaryList = document.getElementById("ticket-summary-list");
    const totalElement = document.getElementById("ticket-total");
    const continueButton = document.getElementById("continue-to-payment");
    const backLink = document.getElementById("back-to-seats");

    if (backLink) {
      const params = new URLSearchParams({
        movie: draft.movieId || "minions",
        date: draft.dateISO || "2026-07-09",
        time: draft.time || "9:30 PM"
      });
      backLink.href = `seat-selection.html?${params.toString()}`;
    }

    const readSelections = () => Object.fromEntries(
      Object.entries(selects).map(([key, select]) => [key, Number(select?.value || 0)])
    );

    const refresh = () => {
      const values = readSelections();
      const selectedCount = Object.values(values).reduce((sum, qty) => sum + qty, 0);
      const total = calculateTicketTotal(values);

      renderTicketSummary(summaryList, values);
      if (totalElement) totalElement.textContent = formatMoney(total);

      if (selectedCount === seatCount) {
        clearFeedback();
        if (continueButton) continueButton.disabled = false;
      } else {
        showFeedback(`Select exactly ${seatCount} ticket${seatCount === 1 ? "" : "s"} to match your selected seats.`, "error");
        if (continueButton) continueButton.disabled = true;
      }
    };

    Object.values(selects).forEach((select) => select?.addEventListener("change", refresh));

    continueButton?.addEventListener("click", () => {
      const values = readSelections();
      const selectedCount = Object.values(values).reduce((sum, qty) => sum + qty, 0);
      if (selectedCount !== seatCount) {
        refresh();
        return;
      }

      draft.ticketTypes = values;
      draft.total = calculateTicketTotal(values);
      saveDraft(draft);
      window.location.href = "payment.html";
    });

    refresh();
  };

  /* ==========================================================
     PAYMENT
  ========================================================== */
  const initPayment = () => {
    const draft = getDraft();
    if (!draft || !draft.ticketTypes || !draft.total) {
      missingDraft();
      return;
    }

    populateSession(draft);
    renderTicketSummary(document.getElementById("payment-summary-list"), draft.ticketTypes);
    const total = document.getElementById("payment-total");
    if (total) total.textContent = formatMoney(draft.total);

    const form = document.getElementById("payment-form");
    const email = document.getElementById("payment-email");
    const card = document.getElementById("payment-card");
    const month = document.getElementById("payment-month");
    const year = document.getElementById("payment-year");
    const cvv = document.getElementById("payment-cvv");

    if (!form || !email || !card || !month || !year || !cvv) return;

    month.insertAdjacentHTML(
      "beforeend",
      Array.from({ length: 12 }, (_, index) => {
        const value = String(index + 1).padStart(2, "0");
        return `<option value="${value}">${value}</option>`;
      }).join("")
    );

    const startYear = new Date().getFullYear();
    year.insertAdjacentHTML(
      "beforeend",
      Array.from({ length: 11 }, (_, index) => {
        const value = startYear + index;
        return `<option value="${value}">${value}</option>`;
      }).join("")
    );

    card.addEventListener("input", () => {
      const digits = card.value.replace(/\D/g, "").slice(0, 19);
      card.value = digits.replace(/(.{4})/g, "$1 ").trim();
    });

    cvv.addEventListener("input", () => {
      cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFeedback();

      const emailValue = email.value.trim();
      const cardDigits = card.value.replace(/\D/g, "");
      const cvvValue = cvv.value.trim();

      if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
        showFeedback("Please enter a valid email address.", "error");
        email.focus();
        return;
      }

      if (cardDigits.length < 13 || cardDigits.length > 19) {
        showFeedback("Please enter a valid credit card number.", "error");
        card.focus();
        return;
      }

      let brand = "";
      if (cardDigits.startsWith("4")) brand = "Visa";
      if (cardDigits.startsWith("5")) brand = "Mastercard";

      if (!brand) {
        showFeedback("Only Visa and Mastercard are accepted.", "error");
        card.focus();
        return;
      }

      if (!month.value || !year.value) {
        showFeedback("Please select the card expiry month and year.", "error");
        month.focus();
        return;
      }

      if (!/^\d{3,4}$/.test(cvvValue)) {
        showFeedback("Please enter a valid 3 or 4 digit CVV.", "error");
        cvv.focus();
        return;
      }

      // Save only a non-reversible local identifier so Booking History can
      // match the same card later. The card number, CVV and email are not saved.
      draft.cardFingerprint = await createCardFingerprint(cardDigits);
      draft.paymentMethod = brand;
      draft.paymentConfirmed = true;
      saveDraft(draft);
      window.location.href = "verification.html";
    });
  };

  /* ==========================================================
     VERIFICATION / FINAL REVIEW
  ========================================================== */
  const initVerification = () => {
    const draft = getDraft();
    if (!draft || !draft.paymentConfirmed) {
      missingDraft();
      return;
    }

    populateSession(draft);

    const review = document.getElementById("verification-review");
    const ticketList = document.getElementById("verification-ticket-list");
    const total = document.getElementById("verification-total");
    const method = document.getElementById("verification-payment-method");
    const checkbox = document.getElementById("confirm-booking-checkbox");
    const confirmButton = document.getElementById("confirm-purchase-button");

    if (review) {
      const tickets = ticketBreakdown(draft.ticketTypes)
        .map((item) => `${item.label} × ${item.quantity}`)
        .join(", ");

      const items = [
        ["Movie", draft.title],
        ["Cinema", `${draft.cinema || "Hyland (TM)"} · ${draft.house || ""}`.replace(/ · $/, "")],
        ["Date & time", `${draft.dateDisplay || formatDate(draft.dateISO)} · ${draft.time || ""}`.replace(/ · $/, "")],
        ["Seats", (draft.seats || []).join(", ")],
        ["Ticket type", tickets],
        ["Payment", draft.paymentMethod || "Card"]
      ];

      review.innerHTML = items.map(([label, value]) => `
        <div class="review-item">
          <dt>${escapeHTML(label)}</dt>
          <dd>${escapeHTML(value || "—")}</dd>
        </div>
      `).join("");
    }

    renderTicketSummary(ticketList, draft.ticketTypes);
    if (total) total.textContent = formatMoney(draft.total);
    if (method) method.textContent = `Payment method: ${draft.paymentMethod || "Card"}`;

    checkbox?.addEventListener("change", () => {
      if (confirmButton) confirmButton.disabled = !checkbox.checked;
      clearFeedback();
    });

    confirmButton?.addEventListener("click", () => {
      if (!checkbox?.checked) {
        showFeedback("Please confirm that the booking details are correct.", "error");
        return;
      }

      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const suffix = String(Math.floor(100 + Math.random() * 900));
      const reference = `NC${yy}${mm}${dd}-${suffix}`;

      const booking = {
        reference,
        movieId: draft.movieId,
        title: draft.title,
        poster: draft.poster,
        cinema: draft.cinema || "Hyland (TM)",
        house: draft.house,
        dateISO: draft.dateISO,
        dateDisplay: draft.dateDisplay || formatDate(draft.dateISO),
        time: draft.time,
        language: draft.language,
        seats: Array.isArray(draft.seats) ? draft.seats : [],
        ticketTypes: draft.ticketTypes,
        total: draft.total,
        paymentMethod: draft.paymentMethod || "Card",
        cardFingerprint: draft.cardFingerprint || "",
        status: "Uncollected",
        createdAt: now.toISOString()
      };

      const history = getHistory();
      history.unshift(booking);
      writeJSON(HISTORY_KEY, history.slice(0, 10));
      writeJSON(LAST_BOOKING_KEY, booking);
      localStorage.removeItem(DRAFT_KEY);
      window.location.href = "transaction-result.html";
    });
  };

  /* ==========================================================
     RESULT
  ========================================================== */
  const initResult = () => {
    const booking = readJSON(LAST_BOOKING_KEY, null) || getHistory()[0];
    const reference = document.getElementById("result-reference");
    const summary = document.getElementById("result-summary");
    const another = document.getElementById("book-another-movie");

    if (!booking) {
      const card = document.querySelector(".result-card");
      if (card) {
        card.innerHTML = `
          <h1>No recent booking found</h1>
          <p class="result-lead">Return to the home page to start a new booking.</p>
          <a class="flow-primary-button" href="index.html">Return to Home</a>
        `;
      }
      return;
    }

    if (reference) reference.textContent = booking.reference || "—";

    if (summary) {
      const items = [
        ["Movie", booking.title],
        ["Cinema", `${booking.cinema || "Hyland (TM)"} · ${booking.house || ""}`.replace(/ · $/, "")],
        ["Date & time", `${booking.dateDisplay || formatDate(booking.dateISO)} · ${booking.time || ""}`.replace(/ · $/, "")],
        ["Seats", (booking.seats || []).join(", ")],
        ["Tickets", `${(booking.seats || []).length} ticket${(booking.seats || []).length === 1 ? "" : "s"}`],
        ["Total", formatMoney(booking.total)]
      ];

      summary.innerHTML = items.map(([label, value]) => `
        <div><span>${escapeHTML(label)}</span><strong>${escapeHTML(value || "—")}</strong></div>
      `).join("");
    }

    another?.addEventListener("click", () => {
      localStorage.removeItem(DRAFT_KEY);
    });
  };

  if (currentPage === "ticket-type.html") initTicketType();
  if (currentPage === "payment.html") initPayment();
  if (currentPage === "verification.html") initVerification();
  if (currentPage === "transaction-result.html") initResult();
})();

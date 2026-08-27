(() => {
  "use strict";

  const cardInput = document.getElementById("booking-card-number");
  const codeInput = document.getElementById("booking-verification-code");
  const searchButton = document.getElementById("booking-search-button");
  const clearButton = document.getElementById("booking-clear-button");
  const feedback = document.getElementById("booking-search-feedback");
  const results = document.getElementById("booking-results");
  const captchaCanvas = document.getElementById("booking-captcha-canvas");
  const captchaRefresh = document.getElementById("booking-captcha-refresh");

  if (
    !cardInput ||
    !codeInput ||
    !searchButton ||
    !clearButton ||
    !feedback ||
    !results ||
    !captchaCanvas ||
    !captchaRefresh
  ) {
    return;
  }

  let captchaCode = "";

  async function createCardFingerprint(cardDigits) {
    const normalized = String(cardDigits || "").replace(/\D/g, "");

    if (window.crypto?.subtle && window.TextEncoder) {
      const data = new TextEncoder().encode(normalized);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }

    let hash = 2166136261;
    for (const character of normalized) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return `local-${(hash >>> 0).toString(16)}`;
  }

  function createCaptchaCode(length = 5) {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let value = "";

    for (let index = 0; index < length; index += 1) {
      value += characters[Math.floor(Math.random() * characters.length)];
    }

    return value;
  }

  function drawCaptcha(code) {
    const context = captchaCanvas.getContext("2d");
    const width = captchaCanvas.width;
    const height = captchaCanvas.height;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#f4f8ff";
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "#8db7eb";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(22, 14);
    context.lineTo(width - 20, height - 14);
    context.stroke();

    context.strokeStyle = "#f08f9d";
    context.beginPath();
    context.moveTo(20, height - 13);
    context.lineTo(width - 18, 15);
    context.stroke();

    for (let index = 0; index < 14; index += 1) {
      context.fillStyle = index % 2 === 0 ? "#c7d9ef" : "#f0c7cd";
      context.beginPath();
      context.arc(
        Math.random() * width,
        Math.random() * height,
        1.1,
        0,
        Math.PI * 2
      );
      context.fill();
    }

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = '700 35px Georgia, "Times New Roman", serif';
    context.fillStyle = "#2d5fa6";

    const spacing = 32;
    const startX = width / 2 - ((code.length - 1) * spacing) / 2;

    code.split("").forEach((character, index) => {
      context.save();
      context.translate(startX + index * spacing, height / 2 + 1);
      context.rotate((Math.random() - 0.5) * 0.18);
      context.fillText(character, 0, 0);
      context.restore();
    });
  }

  function refreshCaptcha({ clearInput = true } = {}) {
    captchaCode = createCaptchaCode();
    drawCaptcha(captchaCode);

    if (clearInput) {
      codeInput.value = "";
    }
  }

  function hideResult() {
    results.hidden = true;
    results.innerHTML = "";
  }

  function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.hidden = false;
    feedback.classList.remove("is-error", "is-success");
    feedback.classList.add(type === "success" ? "is-success" : "is-error");
  }

  function clearFeedback() {
    feedback.textContent = "";
    feedback.hidden = true;
    feedback.classList.remove("is-error", "is-success");
  }

  async function searchBooking() {
    const cardNumber = cardInput.value.trim();
    const cardDigits = cardNumber.replace(/\D/g, "");
    const verificationCode = codeInput.value.trim();

    hideResult();

    if (!cardDigits) {
      showFeedback(
        "Please enter the credit card number used for the original booking.",
        "error"
      );
      cardInput.focus();
      return;
    }

    if (!verificationCode) {
      showFeedback(
        "Please enter the verification code shown on the page.",
        "error"
      );
      codeInput.focus();
      return;
    }

    if (verificationCode.toUpperCase() !== captchaCode) {
      showFeedback(
        "The verification code does not match. A new code has been generated.",
        "error"
      );
      refreshCaptcha();
      codeInput.focus();
      return;
    }

    let history = [];

    try {
      const stored = JSON.parse(localStorage.getItem("newportBookingHistory") || "[]");
      history = Array.isArray(stored) ? stored.slice(0, 10) : [];
    } catch (error) {
      console.warn("Unable to read booking history.", error);
    }

    const fingerprint = await createCardFingerprint(cardDigits);
    history = history.filter((booking) => booking.cardFingerprint === fingerprint);

    if (!history.length) {
      showFeedback(
        "No matching uncollected booking was found. Please check the details or contact Enquiry.",
        "error"
      );
      return;
    }

    const escapeHTML = (value) => String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

    const ticketLabel = (booking) => {
      const count = Array.isArray(booking.seats) ? booking.seats.length : 0;
      return `${count} ticket${count === 1 ? "" : "s"}`;
    };

    results.innerHTML = history.map((booking, index) => `
      <section class="booking-result-card" aria-labelledby="booking-result-heading-${index}">
        <div class="booking-result-header">
          <div>
            <p class="booking-result-eyebrow">Booking found</p>
            <h2 id="booking-result-heading-${index}">${escapeHTML(booking.title || "Booking")}</h2>
            <p class="booking-result-reference">${escapeHTML(booking.reference || "")}</p>
          </div>
          <span class="booking-result-status">${escapeHTML(booking.status || "Uncollected")}</span>
        </div>
        <dl class="booking-result-grid">
          <div><dt>Cinema</dt><dd>${escapeHTML(`${booking.cinema || "Hyland (TM)"}${booking.house ? ` · ${booking.house}` : ""}`)}</dd></div>
          <div><dt>Date & time</dt><dd>${escapeHTML(`${booking.dateDisplay || booking.dateISO || ""}${booking.time ? ` · ${booking.time}` : ""}`)}</dd></div>
          <div><dt>Seats</dt><dd>${escapeHTML(Array.isArray(booking.seats) ? booking.seats.join(", ") : "—")}</dd></div>
          <div><dt>Tickets</dt><dd>${escapeHTML(ticketLabel(booking))}</dd></div>
          <div><dt>Total</dt><dd>${escapeHTML(`HK$${Number(booking.total || 0).toFixed(0)}`)}</dd></div>
          <div><dt>Payment</dt><dd>${escapeHTML(booking.paymentMethod || "Card")}</dd></div>
        </dl>
      </section>
    `).join("");

    showFeedback(
      `${history.length} booking record${history.length === 1 ? "" : "s"} found.`,
      "success"
    );

    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  cardInput.addEventListener("input", () => {
    const digits = cardInput.value.replace(/\D/g, "").slice(0, 19);
    cardInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });

  searchButton.addEventListener("click", searchBooking);

  captchaRefresh.addEventListener("click", () => {
    refreshCaptcha();
    clearFeedback();
    hideResult();
    codeInput.focus();
  });

  [cardInput, codeInput].forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchBooking();
      }
    });
  });

  clearButton.addEventListener("click", () => {
    window.setTimeout(() => {
      clearFeedback();
      hideResult();
      refreshCaptcha({ clearInput: false });
      cardInput.focus();
    }, 0);
  });

  refreshCaptcha({ clearInput: false });
})();

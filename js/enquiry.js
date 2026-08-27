(() => {
  "use strict";

  const form = document.getElementById("enquiry-form");
  const nameInput = document.getElementById("enquiry-name");
  const emailInput = document.getElementById("enquiry-email");
  const phoneInput = document.getElementById("enquiry-phone");
  const contentInput = document.getElementById("enquiry-content");
  const captchaInput = document.getElementById("enquiry-captcha");
  const feedback = document.getElementById("enquiry-feedback");
  const captchaCanvas = document.getElementById("enquiry-captcha-canvas");
  const captchaRefresh = document.getElementById("enquiry-captcha-refresh");

  if (
    !form ||
    !nameInput ||
    !emailInput ||
    !phoneInput ||
    !contentInput ||
    !captchaInput ||
    !feedback ||
    !captchaCanvas ||
    !captchaRefresh
  ) {
    return;
  }

  let captchaCode = "";

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
      captchaInput.value = "";
    }
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

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  captchaRefresh.addEventListener("click", () => {
    refreshCaptcha();
    clearFeedback();
    captchaInput.focus();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const content = contentInput.value.trim();
    const captcha = captchaInput.value.trim();

    if (!name) {
      showFeedback("Please enter your name.", "error");
      nameInput.focus();
      return;
    }

    if (!email) {
      showFeedback("Please enter your email address.", "error");
      emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showFeedback("Please enter a valid email address.", "error");
      emailInput.focus();
      emailInput.select();
      return;
    }

    if (!phone) {
      showFeedback("Please enter your phone number.", "error");
      phoneInput.focus();
      return;
    }

    if (!content) {
      showFeedback("Please enter your enquiry details.", "error");
      contentInput.focus();
      return;
    }

    if (!captcha) {
      showFeedback("Please enter the verification code shown on the page.", "error");
      captchaInput.focus();
      return;
    }

    if (captcha.toUpperCase() !== captchaCode) {
      showFeedback(
        "The verification code does not match. A new code has been generated.",
        "error"
      );
      refreshCaptcha();
      captchaInput.focus();
      return;
    }

    showFeedback(
      "Your enquiry has been received. We will reply as soon as possible.",
      "success"
    );

    form.reset();
    refreshCaptcha({ clearInput: false });
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      if (!feedback.classList.contains("is-success")) {
        clearFeedback();
      }
    }, 0);
  });

  refreshCaptcha({ clearInput: false });
})();

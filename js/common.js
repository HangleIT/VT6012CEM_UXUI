(() => {
  "use strict";

  const aboutToggle = document.getElementById("about-toggle");
  const aboutMenu = document.getElementById("about-menu");
  const mobileButton = document.getElementById("mobile-menu-button");
  const mainNavigation = document.querySelector(".main-navigation");
  const languageButton = document.getElementById("language-button");

  const FACEBOOK_URL =
    "https://www.facebook.com/pages/%E6%96%B0%E5%AF%B6%E9%99%A2%E7%B7%9A-Newport-Circuit/109670132383508";

  /* ----------------------------------------------------------
     Existing shared navigation
  ---------------------------------------------------------- */

  const closeAboutMenu = () => {
    if (!aboutToggle || !aboutMenu) return;

    aboutMenu.hidden = true;
    aboutToggle.setAttribute("aria-expanded", "false");
  };

  if (aboutToggle && aboutMenu) {
    aboutToggle.addEventListener("click", (event) => {
      event.stopPropagation();

      const willOpen = aboutMenu.hidden;

      aboutMenu.hidden = !willOpen;
      aboutToggle.setAttribute("aria-expanded", String(willOpen));
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".nav-dropdown")) {
        closeAboutMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAboutMenu();
      }
    });
  }

  if (mobileButton && mainNavigation) {
    mobileButton.addEventListener("click", () => {
      const isOpen =
        mainNavigation.classList.toggle("mobile-open");

      mobileButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });
  }

  /* ----------------------------------------------------------
     Newport Circuit Facebook
  ---------------------------------------------------------- */

  document
    .querySelectorAll("a.facebook-link, a:has(.facebook-icon)")
    .forEach((link) => {
      link.href = FACEBOOK_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });



  /* ----------------------------------------------------------
     Enquiry page routing
     Redirect legacy Enquiry anchors to the local Enquiry page.
  ---------------------------------------------------------- */

  document
    .querySelectorAll('a[href="#enquiry"], a[href="index.html#enquiry"]')
    .forEach((link) => {
      link.href = "enquiry.html";
    });

  /* ----------------------------------------------------------
     English / Traditional Chinese translation
  ---------------------------------------------------------- */

  const zh = {
    "Home": "首頁",
    "Theatres": "戲院",
    "Now Showing": "現正上映",
    "Coming Soon": "即將上映",
    "Booking History": "購票記錄",
    "About Us": "關於院線",
    "FAQ": "常見問題",
    "Enquiry": "查詢",

    "Ticket selection": "票種選擇",
    "Choose ticket type and quantity": "選擇票種及數量",
    "The total number of tickets must match the number of seats you selected.":
      "門票總數必須與已選座位數量相同。",
    "Adult": "成人",
    "Student": "學生",
    "Child": "小童",
    "Senior": "長者",
    "HK$50 + HK$6 service charge": "HK$50 + HK$6 手續費",
    "HK$45 + HK$6 service charge": "HK$45 + HK$6 手續費",
    "Back to seats": "返回選座",
    "Continue to payment": "繼續付款",
    "Order summary": "訂單摘要",
    "Your tickets": "你的門票",
    "Total": "總額",
    "The HK$6 online service charge is included for each ticket.":
      "每張門票已包括 HK$6 網上購票手續費。",
    "Selected seats": "已選座位",

    "Confirm payment information": "確認付款資料",
    "Enter the payment information required to continue with this booking.":
      "請輸入繼續此訂單所需的付款資料。",
    "Accepted cards": "接受的信用卡",
    "Credit card number": "信用卡號碼",
    "Expiry date": "有效日期",
    "Review booking": "檢查訂單",
    "Back to ticket type": "返回票種",
    "Amount to pay": "應付金額",
    "Visa and Mastercard are accepted. Please enter the card number, expiry date and CVV to continue.":
      "接受 Visa 及 Mastercard。請輸入信用卡號、有效日期及 CVV 以繼續。",

    "Final review": "最後確認",
    "Review and confirm your booking": "檢查並確認訂單",
    "Check the details below before confirming the purchase.":
      "確認購買前，請檢查以下訂單資料。",
    "I confirm that the movie session, seats and ticket quantities above are correct.":
      "我確認以上電影場次、座位及門票數量正確。",
    "Back to payment": "返回付款資料",
    "Confirm purchase": "確認購買",
    "Payment summary": "付款摘要",
    "Final total": "最終總額",
    "Movie": "電影",
    "Ticket type": "票種",

    "Booking successful": "購票成功",
    "Your booking has been confirmed. You can view it in Booking History or return to the home page to book another movie.":
      "你的訂單已確認。你可以前往購票記錄查看，或返回首頁購買其他電影門票。",
    "Booking reference": "訂單編號",
    "View Booking History": "查看購票記錄",
    "Book another movie": "購買其他電影門票",
    "No booking is currently in progress": "目前沒有進行中的訂單",
    "Choose a movie session and seats before continuing to ticket and payment details.":
      "請先選擇電影場次及座位，再繼續選擇票種及付款資料。",
    "Return to Home": "返回首頁",
    "No recent booking found": "找不到最近的購票記錄",
    "Return to the home page to start a new booking.": "返回首頁開始新的訂票。",

    "Customer support": "客戶服務",
    "Please fill in your enquiry. We will reply to you as soon as possible.":
      "請填寫你的查詢內容，我們會盡快回覆。",
    "Name": "姓名",
    "Email": "電郵",
    "Phone Number": "電話號碼",
    "Content": "查詢內容",
    "Tell us how we can help": "請告訴我們如何協助你",
    "Please include any relevant cinema, movie or booking details.":
      "如有相關戲院、電影或訂票資料，請一併提供。",
    "Submit enquiry": "提交查詢",
    "Before submitting": "提交前請確認",
    "Make sure your contact details are correct so that Newport Circuit can reply to your enquiry.":
      "請確保聯絡資料正確，以便新寶院線回覆你的查詢。",
    "Please enter your name.": "請輸入姓名。",
    "Please enter your email address.": "請輸入電郵地址。",
    "Please enter a valid email address.": "請輸入有效的電郵地址。",
    "Please enter your phone number.": "請輸入電話號碼。",
    "Please enter your enquiry details.": "請輸入查詢內容。",
    "Your enquiry has been received. We will reply as soon as possible.":
      "我們已收到你的查詢，並會盡快回覆。",
    "The verification code does not match. A new code has been generated.":
      "驗證碼不正確，系統已產生新的驗證碼。",
    "Refresh": "更新",
    "Refresh code": "更新驗證碼",

    "Find Showtimes": "尋找場次",
    "Cinema": "戲院",
    "Hyland (TM)": "凱都戲院（屯門）",
    "Search movie": "搜尋電影",
    "Language": "語言",
    "All": "全部",
    "Chi": "中文",
    "Eng": "英語",
    "Time": "時間",
    "Any": "不限",
    "Morning": "上午",
    "Evening": "晚上",
    "Date": "日期",
    "Any date": "任何日期",
    "FIRST AVAILABLE": "最早可選",
    "Sun": "星期日",
    "Mon": "星期一",
    "Tue": "星期二",
    "Wed": "星期三",
    "Thu": "星期四",
    "Fri": "星期五",
    "Find showtimes": "搜尋場次",
    "Now showing at Hyland (TM)": "凱都戲院（屯門）現正上映",
    "Movies available": "可選電影",
    "Unidentified Murder": "UFO 離奇命案",
    "First available": "最早可選",
    "Showtimes": "放映時間",
    "Book now": "立即購票",
    "+5 more": "+5 個場次",

    "Quick navigation": "快速導覽",
    "Tickets": "門票",
    "Discounts": "優惠",
    "Payment": "付款",
    "Collection": "取票",
    "Refunds": "退款",
    "Accessibility": "無障礙",
    "Classification": "電影分級",
    "All topics": "所有主題",

    "Seat Plan": "座位表",
    "Ticket Type": "票種",
    "Confirm Payment Info": "確認付款資料",
    "Verification": "驗證",
    "Transaction Result": "交易結果",
    "Selected movie": "已選電影",
    "Show time": "放映時間",
    "Cantonese (Chinese Subtitles)": "粵語（中文字幕）",
    "Available": "可選座位",
    "Wheelchair": "輪椅座位",
    "Sold": "已售",
    "Selected": "已選",
    "Processing": "處理中",
    "Exit": "出口",
    "SCREEN": "銀幕",
    "Seat selection rules": "選座規則",
    "Your selection": "你的選擇",
    "No seats selected": "尚未選擇座位",
    "Confirm seats": "確認座位",

    "Check your recent online ticket transactions.":
      "查詢最近的網上購票記錄。",

    "Use the credit card number from the original booking.":
      "請使用原訂單所用的信用卡號。",

    "Enter the same card number together with the verification code below.":
      "請輸入同一張信用卡號及下方驗證碼。",

    "Credit card number used for purchase":
      "購票時使用的信用卡號",

    "Verification code": "驗證碼",
    "Search booking history": "搜尋購票記錄",
    "Clear": "清除",

    "Before searching": "搜尋前請確認",
    "Check these details first": "請先確認以下資料",

    "Use the same card used for the booking":
      "使用訂票時的同一張信用卡",

    "Supported online payment cards":
      "支援的網上付款信用卡",

    "Online purchases support Visa and Mastercard.":
      "網上購票支援 Visa 及 Mastercard。",

    "Recent uncollected bookings only":
      "只顯示近期未取票記錄",

    "The latest 10 uncollected ticket records will be shown.":
      "系統會顯示最近 10 筆尚未取票的記錄。",

    "Need help?": "需要協助？",
    "Go to Enquiry": "前往查詢",

    "Booking found": "找到購票記錄",
    "Uncollected": "未取票",
    "Date & time": "日期及時間",
    "Seats": "座位",
    "2 tickets": "2 張門票",

    "Movies": "電影",
    "Support": "支援",
    "Privacy Policy": "私隱政策",
    "Terms & Conditions": "條款及細則",
    "About": "關於",
    "Connect": "連結",

    "Please enter the credit card number used for the original booking.":
      "請輸入原訂單所使用的信用卡號。",

    "Please enter the verification code shown on the page.":
      "請輸入頁面顯示的驗證碼。",

    "The verification code does not match. Please try again.":
      "驗證碼不正確，請再試一次。",

    "Booking record found. The matching uncollected booking is shown below.":
      "已找到購票記錄，下方顯示相符的未取票訂單。",
    "No matching uncollected booking was found. Please check the details or contact Enquiry.":
      "找不到相符的未取票記錄，請檢查資料或聯絡查詢服務。",
    "Please enter a valid credit card number.": "請輸入有效的信用卡號。",
    "Only Visa and Mastercard are accepted.": "只接受 Visa 及 Mastercard。",
    "Please select the card expiry month and year.": "請選擇信用卡到期月份及年份。",
    "Please enter a valid 3 or 4 digit CVV.": "請輸入有效的 3 或 4 位 CVV。",
    "Please confirm that the booking details are correct.": "請確認訂單資料正確。",
    "No tickets selected": "尚未選擇門票"
  };

  const zhAttributes = {
    "Switch language": "切換語言",
    "Open navigation menu": "開啟導覽選單",
    "Main navigation": "主要導覽",
    "Newport Circuit Home": "新寶院線首頁",
    "Newport Circuit Facebook": "新寶院線 Facebook",
    "Featured movie": "精選電影",
    "Verification code image": "驗證碼圖片",
    "Supported payment cards": "支援的付款信用卡",
    "Enter credit card number": "輸入信用卡號",
    "Enter captcha code": "輸入驗證碼",
    "Adult ticket quantity": "成人票數量",
    "Student ticket quantity": "學生票數量",
    "Child ticket quantity": "小童票數量",
    "Senior ticket quantity": "長者票數量",
    "Expiry month": "到期月份",
    "Expiry year": "到期年份",
    "e.g. 4111 1111 1111 1111": "例如 4111 1111 1111 1111",
    "3 or 4 digits": "3 或 4 位數字",
    "Enter your name": "輸入姓名",
    "Enter your email address": "輸入電郵地址",
    "Enter your phone number": "輸入電話號碼",
    "Enter the code shown": "輸入圖中的驗證碼",
    "Refresh verification code": "更新驗證碼",
    "Search movie name, e.g. UFO":
      "搜尋電影名稱，例如 UFO"
  };

  const originalTextNodes = new WeakMap();
  const originalAttributes = new WeakMap();

  let currentLanguage =
    localStorage.getItem("uiux-language") === "zh"
      ? "zh"
      : "en";

  function translateDynamicText(text) {
    if (zh[text]) {
      return zh[text];
    }

    const ticketCountMatch =
      text.match(/^(\d+)\s+tickets?$/i);

    if (ticketCountMatch) {
      return `${ticketCountMatch[1]} 張門票`;
    }

    const bookingCountMatch = text.match(/^(\d+) booking records? found\.$/i);
    if (bookingCountMatch) {
      return `找到 ${bookingCountMatch[1]} 筆購票記錄。`;
    }

    const exactTicketMatch = text.match(/^Select exactly (\d+) tickets? to match your selected seats\.$/i);
    if (exactTicketMatch) {
      return `請選擇剛好 ${exactTicketMatch[1]} 張門票，以配合已選座位數量。`;
    }

    const paymentMethodMatch = text.match(/^Payment method:\s*(.+)$/i);
    if (paymentMethodMatch) {
      return `付款方式：${paymentMethodMatch[1]}`;
    }

    const ticketBreakdownMatch = text.match(/^(Adult|Student|Child|Senior) × (\d+)$/);
    if (ticketBreakdownMatch) {
      const labels = { Adult: "成人", Student: "學生", Child: "小童", Senior: "長者" };
      return `${labels[ticketBreakdownMatch[1]]} × ${ticketBreakdownMatch[2]}`;
    }

    return text;
  }

  function applyTextNode(node) {
    if (
      !node ||
      node.nodeType !== Node.TEXT_NODE
    ) {
      return;
    }

    const parent = node.parentElement;

    if (
      !parent ||
      parent.closest("#language-button") ||
      parent.tagName === "SCRIPT" ||
      parent.tagName === "STYLE"
    ) {
      return;
    }

    if (!originalTextNodes.has(node)) {
      originalTextNodes.set(
        node,
        node.nodeValue
      );
    }

    const original =
      originalTextNodes.get(node);

    const trimmed =
      original.trim();

    if (!trimmed) {
      return;
    }

    const replacement =
      currentLanguage === "zh"
        ? translateDynamicText(trimmed)
        : trimmed;

    const leading =
      original.match(/^\s*/)?.[0] || "";

    const trailing =
      original.match(/\s*$/)?.[0] || "";

    const desired =
      `${leading}${replacement}${trailing}`;

    // Important: only write when the text actually changes.
    // Writing the same value again would trigger MutationObserver
    // repeatedly and keep the page in a permanent "loading" state.
    if (node.nodeValue !== desired) {
      node.nodeValue = desired;
    }
  }

  function applyElementAttributes(element) {
    if (!(element instanceof Element)) {
      return;
    }

    const supported = [
      "placeholder",
      "aria-label",
      "title"
    ];

    let originals =
      originalAttributes.get(element);

    if (!originals) {
      originals = {};
      originalAttributes.set(
        element,
        originals
      );
    }

    supported.forEach((attribute) => {
      if (!element.hasAttribute(attribute)) {
        return;
      }

      if (!(attribute in originals)) {
        originals[attribute] =
          element.getAttribute(attribute);
      }

      const original =
        originals[attribute];

      const desired =
        currentLanguage === "zh"
          ? (
              zhAttributes[original] ||
              zh[original] ||
              original
            )
          : original;

      if (
        element.getAttribute(attribute) !== desired
      ) {
        element.setAttribute(
          attribute,
          desired
        );
      }
    });
  }

  function applyLanguage(
    root = document.body
  ) {
    document.documentElement.lang =
      currentLanguage === "zh"
        ? "zh-HK"
        : "en";

    const walker =
      document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT
      );

    let node =
      walker.nextNode();

    while (node) {
      applyTextNode(node);
      node = walker.nextNode();
    }

    if (root instanceof Element) {
      applyElementAttributes(root);
    }

    root
      .querySelectorAll?.(
        "[placeholder], [aria-label], [title]"
      )
      .forEach(
        applyElementAttributes
      );

    if (languageButton) {
      const buttonText =
        currentLanguage === "zh"
          ? "ENG"
          : "中文";

      if (languageButton.textContent !== buttonText) {
        languageButton.textContent = buttonText;
      }

      const buttonLabel =
        currentLanguage === "zh"
          ? "Switch to English"
          : "切換至中文";

      if (
        languageButton.getAttribute("aria-label") !== buttonLabel
      ) {
        languageButton.setAttribute(
          "aria-label",
          buttonLabel
        );
      }
    }
  }

  if (languageButton) {
    languageButton.addEventListener(
      "click",
      () => {
        currentLanguage =
          currentLanguage === "en"
            ? "zh"
            : "en";

        localStorage.setItem(
          "uiux-language",
          currentLanguage
        );

        applyLanguage();
      }
    );
  }

  applyLanguage();

  const observer =
    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type ===
          "characterData"
        ) {
          applyTextNode(
            mutation.target
          );
          return;
        }

        mutation.addedNodes.forEach(
          (addedNode) => {
            if (
              addedNode.nodeType ===
              Node.TEXT_NODE
            ) {
              applyTextNode(
                addedNode
              );
            } else if (
              addedNode.nodeType ===
              Node.ELEMENT_NODE
            ) {
              applyLanguage(
                addedNode
              );
            }
          }
        );
      });
    });

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true,
      characterData: true
    }
  );
})();
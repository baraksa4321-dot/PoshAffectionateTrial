(() => {
  if (window.__MY_ROUTINE_BOOTED__) return;

  // Apply the last selected palette and loading presentation before React
  // hydrates. This keeps the first iOS/PWA paint from flashing the defaults.
  try {
    const storedTheme = window.localStorage.getItem("gymtrack.theme");
    const themes = new Set([
      "pink",
      "blue",
      "green",
      "black",
      "lavender",
      "peach",
      "rose-gold",
      "dark-brown",
      "light-brown",
      "cream",
    ]);
    if (storedTheme && themes.has(storedTheme)) {
      document.documentElement.dataset.theme = storedTheme;
    }

    const storedGender = window.localStorage.getItem("my-routine-loading-gender-v1");
    if (storedGender === "female" || storedGender === "male") {
      document.documentElement.dataset.loadingGender = storedGender;
    }
  } catch {
    // The app applies the same values again after hydration when storage works.
  }

  const loadingCycleStorageKey = "my-routine-loading-cycle-v6";
  const loadingRotationIntervalMs = 2000;
  const loadingIllustrations = [
    "user-strawberry.gif",
    "user-tomato.gif",
    "user-character-01.gif",
    "user-character-02.gif",
    "user-lemon.gif",
    "user-character-03.gif",
    "user-character-04.gif",
    "user-character-05.gif",
    "user-character-06.gif",
    "user-character-07.gif",
    "user-character-08.gif",
    "user-character-09.gif",
    "user-character-10.gif",
  ];
  const loadingMessages = [
    "מעמיסים משקלים, לא תירוצים.",
    "רגע, אנחנו מתחממים.",
    "טוענים יותר מהר מהחזרה האחרונה.",
    "עוד שנייה. אל תעשי עוד סט בינתיים.",
    "המערכת עושה חימום.",
    "מתארגנים על עוד חזרה אחת.",
    "מחשבים. כי “בערך” זה לא ערך תזונתי.",
    "מנסים להבין כמה קלוריות יש ב”טעימה”.",
    "מסדרים לך את התפריט בלי לשפוט את העוגייה.",
    "גם הפיצה יכולה להיכנס. תירגעי.",
    "השריר לא נבנה לבד. גם האפליקציה לא.",
    "אם את מחכה למוטיבציה, זה ייקח יותר זמן.",
    "אל תדאגי, זה לא סט של 20.",
    "3… 2… 1… כאב שרירים.",
    "המערכת מתאוששת מהאימון שלך.",
    "לא נתקענו. אנחנו עושים מנוחה בין סטים.",
    "עוד רגע. תעמידי פנים שאת עושה פלאנק.",
    "טוענים נתונים. לא תירוצים.",
    "המטרה: חזקה יותר, לא רעבה יותר.",
    "פחות “ממחר”, יותר “מה הסט הבא?”",
    "הנתונים שלך בדרך. הסקוואט שלך לא.",
    "זה לוקח פחות זמן מהפסקה בין סטים.",
    "אנחנו יודעים שאמרת “רק עוד פרק אחד”.",
    "טעינה… כי גם לשרירים יש קצב",
    "רגע, אנחנו בודקים אם זה באמת היה “רק כף שמן”.",
    "בודקים אם הקפה עם החלב עדיין נחשב קפה.",
    "רגע, אנחנו שוקלים את הטחינה. היא ביקשה שלא.",
    "מחשבים כמה זה “חתיכה קטנה” של עוגה.",
    "סופרים את הקלוריות שהתחבאו ברוטב.",
    "בודקים אם הסלט עדיין סלט אחרי כל הרוטב.",
    "שנייה, אנחנו סופרים את השקדים שאכלת תוך כדי.",
    "מנסים להבין מי שם את כל הטחינה הזאת.",
    "שנייה, אנחנו בודקים אם הפרמזן היה הכרחי. (הוא היה.)",
    "מחשבים אם העוגייה הייתה שווה את זה. היא הייתה.",
    "בודקים אם אפשר להכניס גם קינוח. ברור שאפשר.",
    "סופרים חלבון. ומתעלמים מהעוגייה.",
    "שנייה, אנחנו נותנים לפיצה את הכבוד שמגיע לה",
  ];

  let openingCycleIndex = 0;
  try {
    const parsed = Number(window.localStorage.getItem(loadingCycleStorageKey));
    if (Number.isSafeInteger(parsed) && parsed >= 0) openingCycleIndex = parsed;
    const nextCycleIndex = openingCycleIndex === Number.MAX_SAFE_INTEGER ? 0 : openingCycleIndex + 1;
    window.localStorage.setItem(loadingCycleStorageKey, String(nextCycleIndex));
  } catch {
    // The current opening still gets a deterministic in-memory cycle.
  }
  window.__MY_ROUTINE_LOADING_CYCLE_INDEX__ = openingCycleIndex;

  let rotationTimer = 0;
  let observer = null;
  let rotationTick = 0;
  let stopped = false;

  const stopLoadingRotation = () => {
    if (stopped) return;
    stopped = true;
    if (rotationTimer) window.clearInterval(rotationTimer);
    if (observer) observer.disconnect();
  };

  const loadingMessageForGender = (message, gender) => {
    if (gender === "female") return message;
    return message
      .replaceAll("אל תעשי", "אל תעשה")
      .replaceAll("תירגעי", "תירגע")
      .replaceAll("אם את מחכה", "אם אתה מחכה")
      .replaceAll("אל תדאגי", "אל תדאג")
      .replaceAll("תעמידי פנים", "תעמיד פנים");
  };

  const renderLoadingRotation = () => {
    if (window.__MY_ROUTINE_BOOTED__) {
      stopLoadingRotation();
      return false;
    }

    const loadingScreen = document.querySelector(".loading-screen");
    const media = loadingScreen?.querySelector(".loading-simple-video");
    const message = loadingScreen?.querySelector(".loading-witty-message");
    if (!(media instanceof HTMLVideoElement) || !(message instanceof HTMLElement)) return false;

    const animationIndex = (openingCycleIndex + rotationTick) % loadingIllustrations.length;
    const messageIndex = (openingCycleIndex + rotationTick) % loadingMessages.length;
    const illustration = loadingIllustrations[animationIndex];
    const cycle = openingCycleIndex + rotationTick;
    const animationFile = illustration.replace(".gif", ".mp4");
    const nextSource = `/loading/tinted/${animationFile}?v=video-safe-1&cycle=${cycle}`;
    media.poster = `/loading/tinted/${illustration}?v=poster-safe-1`;
    if (media.getAttribute("src") !== nextSource) {
      media.src = nextSource;
      media.load();
    }
    void media.play().catch(() => {
      // Muted inline video can need one more attempt after the first paint.
    });
    message.textContent = loadingMessageForGender(
      loadingMessages[messageIndex],
      document.documentElement.dataset.loadingGender,
    );
    rotationTick += 1;
    return true;
  };

  const startLoadingRotation = () => {
    if (stopped || window.__MY_ROUTINE_BOOTED__) return;
    if (!renderLoadingRotation()) return;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    rotationTimer = window.setInterval(renderLoadingRotation, loadingRotationIntervalMs);
  };

  if (document.documentElement) {
    observer = new MutationObserver(startLoadingRotation);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    startLoadingRotation();
  }

  const recoveryKey = "__myroutine_boot_recovery_v4";
  const isPreviewHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".replit.dev");
  const watchdogDelay = isPreviewHost ? 30_000 : 12_000;

  const navigateWithFreshShell = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("__myroutine_clean");
    url.searchParams.set("__myroutine_boot", "3");
    window.location.replace(url.toString());
  };

  window.setTimeout(async () => {
    if (window.__MY_ROUTINE_BOOTED__) return;

    const fallback = document.querySelector("[data-app-boot-fallback]");
    const manualRecovery = new URL(window.location.href).searchParams.has("__myroutine_clean");
    let shouldRetry = manualRecovery;
    try {
      shouldRetry =
        manualRecovery || window.sessionStorage.getItem(recoveryKey) !== "1";
      if (shouldRetry) window.sessionStorage.setItem(recoveryKey, "1");
      if (manualRecovery) window.sessionStorage.removeItem(recoveryKey);
    } catch {
      // A manual recovery link must still work when Safari blocks storage.
    }

    if (shouldRetry) {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }
        if ("caches" in window) {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
        }
      } catch {
        // The second boot attempt is still useful when storage APIs are blocked.
      }
      navigateWithFreshShell();
      return;
    }

    if (fallback instanceof HTMLElement) fallback.hidden = false;
  }, watchdogDelay);
})();
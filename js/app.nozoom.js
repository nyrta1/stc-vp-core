/**
 * app.nozoom.js
 * SRP: Отключает все виды зума (pinch, ctrl+scroll, двойной тап и пр.)
 */
export function disablePageZoom() {
  // 🔒 Отключаем масштабирование через Ctrl + колесо
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 🔒 Отключаем pinch-zoom (на мобильных)
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 🔒 Отключаем double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );

  // 🔒 Дополнительно фиксируем meta viewport (чтобы iOS не увеличивал текст)
  const meta = document.querySelector("meta[name=viewport]");
  if (meta) {
    meta.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    );
  } else {
    const m = document.createElement("meta");
    m.name = "viewport";
    m.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.head.appendChild(m);
  }

  console.log("[NoZoom] Zoom and scaling disabled");
}

/**
 * camera.playpause.js
 * SRP — управляет только Play/Pause и меняет иконку.
 * 💬 Добавлено логирование для отладки.
 */
export function enableCameraPlayPause(container) {
  if (!container) return;

  console.log("[PlayPause] ✅ initialized");

  // === Клик по кнопке ===
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-playpause]");
    if (!btn) return;

    const card = btn.closest("[data-cam-id]");
    if (!card) return;

    const camId = card.dataset.camId;
    const videoEl = card.querySelector("video.cam-video");
    if (!videoEl) {
      console.warn(`[PlayPause][${camId}] ⚠️ video element not found`);
      return;
    }

    const icon = btn.querySelector("i");
    if (!icon) {
      console.warn(`[PlayPause][${camId}] ⚠️ icon not found`);
      return;
    }

    // === Переключаем play/pause ===
    if (videoEl.paused) {
      console.log(`[PlayPause][${camId}] ▶️ play()`);
      videoEl.play().catch((err) => {
        console.error(`[PlayPause][${camId}] ❌ play() failed:`, err);
      });
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    } else {
      console.log(`[PlayPause][${camId}] ⏸️ pause()`);
      videoEl.pause();
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    }
  });

  // === Автообновление иконки на событиях ===
  const videos = container.querySelectorAll("video.cam-video");
  videos.forEach((videoEl) => {
    const card = videoEl.closest("[data-cam-id]");
    const camId = card?.dataset?.camId || "unknown";
    const btn = card?.querySelector("[data-playpause] i");
    if (!btn) return;

    videoEl.addEventListener("play", () => {
      console.log(`[PlayPause][${camId}] 🔵 event: play`);
      btn.classList.remove("fa-play");
      btn.classList.add("fa-pause");
    });

    videoEl.addEventListener("pause", () => {
      console.log(`[PlayPause][${camId}] 🟠 event: pause`);
      btn.classList.add("fa-play");
      btn.classList.remove("fa-pause");
    });

    videoEl.addEventListener("ended", () => {
      console.log(`[PlayPause][${camId}] ⚪ event: ended`);
      btn.classList.add("fa-play");
      btn.classList.remove("fa-pause");
    });
  });
}

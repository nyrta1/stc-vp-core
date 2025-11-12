/**
 * camera.speed.js
 * SRP — управляет только скоростью воспроизведения видео.
 * SPA — не трогает состояние других модулей (timeline, sound и т.п.)
 */

export function enableCameraSpeed(container, cameras = []) {
  if (!container) return;

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-speed]");
    if (!btn) return;

    const card = btn.closest("[data-cam-id]");
    if (!card) return;

    const camId = parseInt(card.dataset.camId);
    const camera = cameras.find((c) => c.id === camId);
    if (!camera) return;

    const videoEl = card.querySelector("video.cam-video");
    if (!videoEl) return;

    const newRate = parseFloat(btn.dataset.speed);
    if (isNaN(newRate)) return;

    // обновляем скорость
    videoEl.playbackRate = newRate;
    camera.playbackRate = newRate;

    // визуальный отклик
    const allBtns = card.querySelectorAll("[data-speed]");
    allBtns.forEach((b) =>
      b.classList.remove("bg-white/25", "font-semibold", "text-white")
    );
    btn.classList.add("bg-white/25", "font-semibold", "text-white");
  });
}

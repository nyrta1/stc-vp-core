/**
 * camera.zoom.js
 * SRP — управляет масштабированием (Zoom) и панорамированием (Pan) видео.
 * 💎 Версия 2.1 — авто-reset при 1x, плавная трансформация, wheel-зум.
 */
export function enableCameraZoom(container) {
  if (!container) return;

  const MAX_ZOOM = 5;
  const MIN_ZOOM = 1;
  const ZOOM_STEP = 0.25;

  // === Клик по кнопкам ===
  container.addEventListener("click", (e) => {
    const zoomIn = e.target.closest("[data-zoom-in]");
    const zoomOut = e.target.closest("[data-zoom-out]");
    const reset = e.target.closest("[data-zoom-reset]");
    if (!zoomIn && !zoomOut && !reset) return;

    const card = e.target.closest("[data-cam-id]");
    if (!card) return;

    const videoEl = card.querySelector("video.cam-video");
    if (!videoEl) return;

    initVideoState(videoEl);

    if (zoomIn) {
      videoEl._zoom = Math.min(videoEl._zoom + ZOOM_STEP, MAX_ZOOM);
    }

    if (zoomOut) {
      videoEl._zoom = Math.max(videoEl._zoom - ZOOM_STEP, MIN_ZOOM);

      // 🔥 Автоматический сброс при достижении 1x
      if (videoEl._zoom <= 1.01) {
        videoEl._zoom = 1;
        videoEl._offset = { x: 0, y: 0 };
      }
    }

    if (reset) {
      videoEl._zoom = 1;
      videoEl._offset = { x: 0, y: 0 };
    }

    applyTransform(videoEl);
  });

  // === Панорамирование (drag) ===
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  container.addEventListener("mousedown", (e) => {
    const videoEl = e.target.closest("video.cam-video");
    if (!videoEl || videoEl._zoom <= 1) return;
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    videoEl.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    document
      .querySelectorAll("video.cam-video")
      .forEach((v) => (v.style.cursor = v._zoom > 1 ? "grab" : "default"));
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const videoEl = document.querySelector("video.cam-video:hover");
    if (!videoEl || videoEl._zoom <= 1) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;

    const maxOffsetX = (videoEl.offsetWidth * (videoEl._zoom - 1)) / 2;
    const maxOffsetY = (videoEl.offsetHeight * (videoEl._zoom - 1)) / 2;

    videoEl._offset.x = clamp(videoEl._offset.x + dx, -maxOffsetX, maxOffsetX);
    videoEl._offset.y = clamp(videoEl._offset.y + dy, -maxOffsetY, maxOffsetY);

    applyTransform(videoEl);
  });

  // === Wheel Zoom (Ctrl+Scroll или просто колёсико) ===
  container.addEventListener(
    "wheel",
    (e) => {
      const videoEl = e.target.closest("video.cam-video");
      if (!videoEl) return;
      initVideoState(videoEl);

      e.preventDefault();

      const delta = Math.sign(e.deltaY);
      videoEl._zoom -= delta * ZOOM_STEP;
      videoEl._zoom = clamp(videoEl._zoom, MIN_ZOOM, MAX_ZOOM);

      // 🔥 Автоматический сброс при минимальном зуме
      if (videoEl._zoom <= 1.01) {
        videoEl._zoom = 1;
        videoEl._offset = { x: 0, y: 0 };
      }

      applyTransform(videoEl);
    },
    { passive: false }
  );

  // === Инициализация состояния ===
  function initVideoState(videoEl) {
    if (!videoEl._zoom) videoEl._zoom = 1;
    if (!videoEl._offset) videoEl._offset = { x: 0, y: 0 };
  }

  // === Применяем трансформацию ===
  function applyTransform(videoEl) {
    const { x, y } = videoEl._offset;
    const z = videoEl._zoom;

    videoEl.style.transform = `translate(${x}px, ${y}px) scale(${z})`;
    videoEl.style.transformOrigin = "center center";
    videoEl.style.transition = "transform 0.15s ease-out";
    videoEl.style.cursor = z > 1 ? "grab" : "default";
  }

  // === Утилита ===
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}

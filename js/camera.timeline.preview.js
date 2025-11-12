/**
 * [ DEPREACATED ] | [ REMOVED IN FUTURE VERSIONS ]
 * camera.timeline.preview.js
 * Показывает мини-превью кадра из <video> при движении по таймлайну.
 */
export function enableTimelinePreview(container) {
  const video = container.querySelector("video.cam-video");
  const slot = container.querySelector("[data-timeline-slot]");
  if (!video || !slot) return;

  // создаём canvas для рендера кадра
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // создаём элемент превью
  const preview = document.createElement("div");
  preview.className = `
    fixed pointer-events-none z-[999]
    border border-white/30 rounded-md overflow-hidden
    bg-black shadow-lg transition-opacity
    opacity-0 scale-95
  `;
  preview.innerHTML = `
    <canvas width="160" height="90" class="block"></canvas>
    <div class="text-[10px] text-center text-white/80 bg-black/60 py-0.5"></div>
  `;
  document.body.appendChild(preview);

  const previewCanvas = preview.querySelector("canvas");
  const previewLabel = preview.querySelector("div");

  // Функция рендера кадра в превью
  function drawFrame() {
    if (!video.videoWidth || !video.videoHeight) return;
    const w = 160, h = 90;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const previewCtx = previewCanvas.getContext("2d");
    previewCtx.clearRect(0, 0, w, h);
    previewCtx.drawImage(canvas, 0, 0, w, h);
  }

  // Слушаем наведение и движение по таймлайну
  slot.addEventListener("mousemove", (e) => {
    const rect = slot.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(x / rect.width, 1));

    // позиция превью
    preview.style.left = `${e.pageX + 10}px`;
    preview.style.top = `${e.pageY - 110}px`;
    preview.style.opacity = "1";
    preview.style.scale = "1";

    // рендер кадра
    drawFrame();

    // обновляем подпись времени
    const duration = video.duration || 0;
    const t = percent * duration;
    const h = String(Math.floor(t / 3600)).padStart(2, "0");
    const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
    const s = String(Math.floor(t % 60)).padStart(2, "0");
    previewLabel.textContent = `${h}:${m}:${s}`;
  });

  slot.addEventListener("mouseleave", () => {
    preview.style.opacity = "0";
    preview.style.scale = "0.95";
  });
}

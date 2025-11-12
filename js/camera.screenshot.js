/**
 * camera.screenshot.js
 * SRP — делает только одно: сохраняет кадр из <video>.
 */
export function enableCameraScreenshot(container) {
  if (!container) return;

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-screenshot]");
    if (!btn) return;

    const card = btn.closest("[data-cam-id]");
    if (!card) return;

    const videoEl = card.querySelector("video.cam-video");
    if (!videoEl) return;

    try {
      // создаем canvas и копируем кадр
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      // создаем Blob → URL → скачиваем
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        const url = URL.createObjectURL(blob);
        a.href = url;

        // имя файла
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        a.download = `camera-snapshot-${timestamp}.png`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");

      // визуальная вспышка для эффекта 💥
      const flash = document.createElement("div");
      flash.className =
        "absolute inset-0 bg-white/80 animate-[fadeOut_0.4s_ease-in-out]";
      card.appendChild(flash);
      setTimeout(() => flash.remove(), 400);
    } catch (err) {
      console.error("Screenshot failed:", err);
    }
  });
}

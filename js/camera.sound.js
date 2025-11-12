/**
 * camera.sound.js
 * SRP-модуль для управления звуком (mute/unmute)
 */
export function enableCameraSound(container, cameras = []) {
  if (!container) return;

  // при инициализации сразу мьютим все камеры и обновляем иконки
  cameras.forEach((camera) => {
    camera.isMuted = true;
    const card = container.querySelector(`[data-cam-id="${camera.id}"]`);
    const btn = card?.querySelector("[title='Звук']");
    const icon = btn?.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-microphone");
      icon.classList.add("fa-microphone-slash", "text-red-500");
    }

    const video = card?.querySelector("video");
    if (video) video.muted = true;
  });

  // обработка кликов (переключение mute/unmute)
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[title='Звук']");
    if (!btn) return;

    const card = btn.closest("[data-cam-id]");
    const camId = parseInt(card?.dataset?.camId);
    const camera = cameras.find((c) => c.id === camId);
    if (!camera) return;

    // переключаем mute
    camera.isMuted = !camera.isMuted;

    // обновляем UI (иконку)
    const icon = btn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-microphone", !camera.isMuted);
      icon.classList.toggle("fa-microphone-slash", camera.isMuted);
      icon.classList.toggle("text-red-500", camera.isMuted); // визуально глушен
    }

    // применяем к DOM-элементу (видео или iframe)
    const video = card.querySelector("video");
    const iframe = card.querySelector("iframe");

    if (video) {
      video.muted = camera.isMuted;
    } else if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          { type: "AUDIO_TOGGLE", muted: camera.isMuted },
          "*"
        );
      } catch (err) {
        console.warn(`[Camera ${camera.id}] iframe mute unsupported`);
      }
    }
  });
}

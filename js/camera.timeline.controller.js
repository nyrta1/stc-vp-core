import { renderArchiveTimeline } from "./camera.timeline.archive.js";
import { renderRecordingTimeline } from "./camera.timeline.record.js";

/**
 * Управляет переключением таймлайнов
 */
export function enableTimelineController(container, cameras = [], isArchivePage = false) {
  if (!container) return;

  // Инициализация: показать архив, если страница архива
  cameras.forEach((cam) => {
    const card = container.querySelector(`[data-cam-id="${cam.id}"]`);
    if (card && isArchivePage) renderArchiveTimeline(card, cam);
  });

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[title='Запись']");
    if (!btn) return;

    const card = btn.closest("[data-cam-id]");
    const camId = parseInt(card?.dataset?.camId);
    const camera = cameras.find((c) => c.id === camId);
    if (!camera) return;

    // переключаем режим
    const slot = card.querySelector("[data-timeline-slot]");
    if (!slot) return;

    const isRecording = slot.dataset.mode === "record";
    slot.dataset.mode = isRecording ? "archive" : "record";

    if (isRecording) renderArchiveTimeline(card, camera);
    else renderRecordingTimeline(card, camera);
  });
}

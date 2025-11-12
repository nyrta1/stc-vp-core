/**
 * camera.timeline.record.js
 * 🎯 Таймлайн записи в стиле archive.js: готовые thumbnail'ы (без videoGhost),
 * 🟨 точки A–B, подсветка диапазона, кнопка "Скачать" с API.
 */

// === utils ===
function toDaySeconds(iso) {
  const d = new Date(iso);
  const s = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  return Math.max(0, Math.min(s, 86400));
}

function randomFileName() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 20; i++) out += chars[(Math.random() * chars.length) | 0];
  return out + ".mp4";
}

function buildTimelineSegments(videoList) {
  if (!Array.isArray(videoList) || !videoList.length)
    return [{ start: 0, end: 86400, type: "empty" }];

  const sorted = videoList
    .map(v => ({
      start: toDaySeconds(v.time),
      end: toDaySeconds(v.end || v.time),
      link: v.link,
      thumbnail: v.thumbnail || null,
    }))
    .sort((a, b) => a.start - b.start);

  const segments = [];
  let lastEnd = 0;
  for (const seg of sorted) {
    if (seg.start > lastEnd) segments.push({ start: lastEnd, end: seg.start, type: "empty" });
    segments.push({ ...seg, type: "video" });
    lastEnd = seg.end;
  }
  if (lastEnd < 86400) segments.push({ start: lastEnd, end: 86400, type: "empty" });
  return segments;
}

const ZOOM_LEVELS = [
  { level: 1, label: "24h", range: 86400, step: 3600 },
  { level: 2, label: "12h", range: 43200, step: 1800 },
  { level: 3, label: "6h", range: 21600, step: 900 },
  { level: 4, label: "3h", range: 10800, step: 600 },
  { level: 5, label: "1h", range: 3600, step: 300 },
];

function clamp01(x) {
  return Math.min(100, Math.max(0, x));
}

// === main ===
export async function renderRecordingTimeline(container, camera, zoom = 1) {
  const slot = container.querySelector("[data-timeline-slot]");
  if (!slot) return;

  const videoList = camera.videoArchiveUrlList || [];
  const segments = buildTimelineSegments(videoList);

  // точки A–B (дефолт 08:00—10:00)
  let pointA = 8 * 3600;
  let pointB = 10 * 3600;
  let currentSec = (pointA + pointB) / 2;
  let dragging = null;

  let currentZoom = Math.min(Math.max(zoom, 1), ZOOM_LEVELS.length);
  let visibleRange = ZOOM_LEVELS[currentZoom - 1].range;
  let rangeStart = 0;
  let rangeEnd = visibleRange;

  function updateRange() {
    const z = ZOOM_LEVELS[currentZoom - 1];
    visibleRange = z?.range || 86400;

    rangeStart = currentSec - visibleRange / 2;
    rangeEnd = currentSec + visibleRange / 2;

    if (rangeStart < 0) {
      rangeEnd -= rangeStart;
      rangeStart = 0;
    }
    if (rangeEnd > 86400) {
      const diff = rangeEnd - 86400;
      rangeStart -= diff;
      rangeEnd = 86400;
    }
  }
  updateRange();

  function generateMarks() {
    const { step } = ZOOM_LEVELS[currentZoom - 1] || { step: 3600 };
    const marks = [];
    for (let s = Math.ceil(rangeStart / step) * step; s <= rangeEnd; s += step) {
      const h = String(Math.floor(s / 3600)).padStart(2, "0");
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      marks.push({ sec: s, label: `${h}:${m}` });
    }
    return marks;
  }

  function showOverlay(text) {
    let overlay = document.getElementById("timeline-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "timeline-overlay";
      overlay.className =
        "fixed inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-lg font-medium z-[9999]";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="flex flex-col items-center gap-3">
        <i class="fa-solid fa-spinner fa-spin text-2xl text-amber-400"></i>
        <div>${text}</div>
      </div>`;
  }
  function hideOverlay() {
    const overlay = document.getElementById("timeline-overlay");
    if (overlay) overlay.remove();
  }

  async function drawTimeline() {
    const marks = generateMarks();
    const { step } = ZOOM_LEVELS[currentZoom - 1] || { step: 3600 };

    // 🔥 адаптивная высота thumbnail
    const thumbHeight = 56;

    slot.innerHTML = `
      <div class="relative h-24 w-full rounded-md overflow-hidden bg-neutral-900/40 select-none">
        <div class="absolute left-0 top-[55%] -translate-y-1/2 h-2 w-full bg-neutral-700 rounded-full"></div>

        ${segments
          .filter(s => s.end >= rangeStart && s.start <= rangeEnd)
          .map(s => {
            const left = ((s.start - rangeStart) / visibleRange) * 100;
            const width = ((s.end - s.start) / visibleRange) * 100;
            return `<div class="absolute top-1/2 -translate-y-1/2 h-2 rounded-full ${
              s.type === "video" ? "bg-emerald-500" : "bg-red-500/40"
            }" style="left:${left}%; width:${width}%;"></div>`;
          })
          .join("")}

        <div id="ab-layer"></div>

        ${marks
          .map(
            m => `
          <div class="absolute top-0 text-[10px] text-center text-white/70"
               style="left:${((m.sec - rangeStart) / visibleRange) * 100}%;">
            <div class="w-[1px] h-5 bg-white/30 mx-auto"></div>
            <div>${m.label}</div>
          </div>`
          )
          .join("")}
      </div>
    `;

    const containerEl = slot.querySelector(".relative");

    const visibleSegments = segments.filter(
      s => s.type === "video" && s.end >= rangeStart && s.start <= rangeEnd
    );

    const chosenByBucket = new Map();
    for (const seg of visibleSegments) {
      if (!seg.thumbnail) continue;
      const bucket = Math.floor(seg.start / step);
      if (!chosenByBucket.has(bucket)) chosenByBucket.set(bucket, seg);
    }

    const entries = Array.from(chosenByBucket.entries()).sort((a, b) => a[0] - b[0]);
    let index = 0;
    const batchSize = 8;

    function renderBatch() {
      const batch = entries.slice(index, index + batchSize);
      for (const [bucket, seg] of batch) {
        const bucketStart = bucket * step;
        const bucketEnd = bucketStart + step;

        const visStart = Math.max(rangeStart, bucketStart);
        const visEnd = Math.min(rangeEnd, bucketEnd);
        if (visEnd <= visStart) continue;

        const mid = (visStart + visEnd) / 2;
        const leftPercent = clamp01(((mid - rangeStart) / visibleRange) * 100);
        const widthPercent = ((visEnd - visStart) / visibleRange) * 100 * 1.2;

        const img = document.createElement("img");
        img.src = seg.thumbnail;
        img.alt = "thumb";
        img.className = `
          absolute object-cover border border-neutral-700/70
          bg-neutral-800/80 opacity-0 transition-opacity duration-500 rounded-md
          shadow-[0_2px_5px_rgba(0,0,0,0.6)]
        `;
        // 🔧 размеры и позиционирование (аналог archive.js)
        img.style.top = "0%";
        img.style.transform = "translateX(-40%)";
        img.style.left = `${leftPercent}%`;
        img.style.width = `${widthPercent}%`;
        img.style.height = `${thumbHeight * 0.4}px`; // 🟨 адаптивная высота
        img.onload = () => (img.style.opacity = "1");
        containerEl.appendChild(img);
      }

      index += batchSize;
      if (index < entries.length) requestIdleCallback(renderBatch);
    }

    renderBatch();
    drawAB();
  }

  function drawAB() {
    const abLayer = slot.querySelector("#ab-layer");
    if (!abLayer) return;
    const aPos = ((pointA - rangeStart) / visibleRange) * 100;
    const bPos = ((pointB - rangeStart) / visibleRange) * 100;

    abLayer.innerHTML = `
      <div class="absolute top-1/2 -translate-y-1/2 h-2 bg-amber-400/70 rounded-full"
           style="left:${Math.min(aPos, bPos)}%; width:${Math.abs(bPos - aPos)}%;"></div>

      <div id="pointA"
           class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 border border-white
                  rounded-full shadow-md cursor-ew-resize active:scale-125"
           style="left:${aPos}%;"></div>

      <div id="pointB"
           class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 border border-white
                  rounded-full shadow-md cursor-ew-resize active:scale-125"
           style="left:${bPos}%;"></div>
    `;
  }

  slot.addEventListener("mousedown", e => {
    if (e.target.id === "pointA" || e.target.id === "pointB") {
      dragging = e.target.id;
      e.preventDefault();
    }
  });
  window.addEventListener("mouseup", () => (dragging = null));
  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    const rect = slot.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const sec = rangeStart + (x / rect.width) * visibleRange;

    if (dragging === "pointA") pointA = Math.min(sec, pointB - 60);
    else if (dragging === "pointB") pointB = Math.max(sec, pointA + 60);

    currentSec = (pointA + pointB) / 2;
    drawAB();
  });

  slot.addEventListener(
    "wheel",
    e => {
      e.preventDefault();
      if (e.deltaY < 0 && currentZoom < ZOOM_LEVELS.length) currentZoom++;
      if (e.deltaY > 0 && currentZoom > 1) currentZoom--;
      updateRange();
      drawTimeline();
    },
    { passive: false }
  );

  slot._timelineState = { get pointA() { return pointA; }, get pointB() { return pointB; } };
  drawTimeline();
}

/**
 * 🟡 Глобальный слушатель скачивания (вызывается из camera.grid.js)
 */
window.addEventListener("record:download", async e => {
  try {
    const { cameraId } = e.detail;
    const camera = window.cameraData?.find(c => c.id == cameraId);
    if (!camera) {
      alert("🚫 Камера не найдена.");
      return;
    }

    const slot = document.querySelector(`[data-cam-id="${cameraId}"] [data-timeline-slot]`);
    if (!slot || !slot._timelineState) {
      alert("❌ Таймлайн ещё не инициализирован.");
      return;
    }

    const { pointA, pointB } = slot._timelineState;
    const min = Math.min(pointA, pointB);
    const max = Math.max(pointA, pointB);

    const links = (camera.videoArchiveUrlList || [])
      .filter(v => {
        const s = toDaySeconds(v.time);
        const e = toDaySeconds(v.end || v.time);
        return e >= min && s <= max;
      })
      .map(v => v.link);

    if (!links.length) {
      alert("🚫 Нет видео в выбранном диапазоне.");
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black/70 flex items-center justify-center text-white z-[9999]";
    overlay.innerHTML = `
      <div class="flex flex-col items-center gap-3">
        <i class="fa-solid fa-spinner fa-spin text-2xl text-amber-400"></i>
        <div>Файл скачивается, подождите...</div>
      </div>`;
    document.body.appendChild(overlay);

    const resp = await fetch("http://100.127.245.21:5678/webhook/concat-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videos: links,
        output_name: randomFileName(),
      }),
    });

    const result = await resp.json();
    overlay.remove();

    if (result.ok && result.public_url) {
      const a = document.createElement("a");
      a.href = result.public_url;
      a.download = result.output_name || "record.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert("Ошибка: не удалось получить ссылку на файл.");
    }
  } catch (err) {
    alert("Ошибка при скачивании файла: " + err.message);
  }
});
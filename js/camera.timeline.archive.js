/**
 * camera.timeline.archive.refactored.js
 * 📼 Таймлайн архивных видео (stable, readable, same functionality)
 */

function toDaySeconds(isoString) {
  const d = new Date(isoString);
  return Math.min(Math.max(d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(), 0), 86400);
}

function buildTimelineSegments(list = []) {
  if (!list.length) return [{ start: 0, end: 86400, type: "empty" }];

  const sorted = list
    .map(v => ({
      start: toDaySeconds(v.time),
      end: toDaySeconds(v.end),
      link: v.link,
      thumbnail: v.thumbnail ?? null,
    }))
    .sort((a, b) => a.start - b.start);

  const segments = [];
  let lastEnd = 0;

  for (const seg of sorted) {
    if (seg.start > lastEnd)
      segments.push({ start: lastEnd, end: seg.start, type: "empty" });
    segments.push({ ...seg, type: "video" });
    lastEnd = seg.end;
  }
  if (lastEnd < 86400)
    segments.push({ start: lastEnd, end: 86400, type: "empty" });

  return segments;
}

export async function renderArchiveTimeline(container, camera, zoom = 1) {
  const slot = container.querySelector("[data-timeline-slot]");
  const videoEl = container.querySelector("video.cam-video");
  if (!slot || !videoEl) return;

  const segments = buildTimelineSegments(camera.videoArchiveUrlList);
  const firstVideo = segments.find(s => s.type === "video");
  let currentSegment = firstVideo || segments[0];
  let currentSec = currentSegment.start ?? 0;
  let isDragging = false;

  const zoomLevels = [
    { level: 1, label: "24h", range: 86400, step: 3600 },
    { level: 2, label: "12h", range: 43200, step: 1800 },
    { level: 3, label: "6h", range: 21600, step: 900 },
    { level: 4, label: "3h", range: 10800, step: 600 },
    { level: 5, label: "1h", range: 3600, step: 300 },
  ];

  let currentZoom = zoom;
  let visibleRange = zoomLevels.find(z => z.level === currentZoom)?.range ?? 86400;
  let rangeStart = 0, rangeEnd = visibleRange;

  const updateRange = () => {
    const z = zoomLevels.find(z => z.level === currentZoom) ?? zoomLevels[0];
    visibleRange = z.range;
    rangeStart = Math.max(0, currentSec - visibleRange / 2);
    rangeEnd = Math.min(86400, rangeStart + visibleRange);
    if (rangeEnd - rangeStart < visibleRange) rangeStart = Math.max(0, 86400 - visibleRange);
  };

  const generateMarks = () => {
    const { step } = zoomLevels.find(z => z.level === currentZoom) ?? { step: 3600 };
    const marks = [];
    for (let s = Math.ceil(rangeStart / step) * step; s <= rangeEnd; s += step) {
      const h = String(Math.floor(s / 3600)).padStart(2, "0");
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      marks.push({ sec: s, label: `${h}:${m}` });
    }
    return marks;
  };

  const overlay = (() => {
    let o = container.querySelector("#no-data-overlay");
    if (!o) {
      o = document.createElement("div");
      o.id = "no-data-overlay";
      o.className =
        "absolute inset-0 flex items-center justify-center bg-black/60 text-white/80 text-sm font-medium opacity-0 pointer-events-none transition-opacity";
      o.innerHTML = "<i class='fa-solid fa-ban text-red-500 mr-2'></i> Нет данных";
      container.appendChild(o);
    }
    return o;
  })();

  const applyCameraSettings = () => {
    videoEl.playbackRate = camera.playbackRate ?? 1;
    videoEl.muted = camera.isMuted ?? true;
  };

  const drawTimeline = async () => {
    const marks = generateMarks();
    const { step } = zoomLevels.find(z => z.level === currentZoom);
    const thumbHeight = 56;

    const visibleSegments = segments.filter(
      s => s.end >= rangeStart && s.start <= rangeEnd
    );

    slot.innerHTML = `
      <div class="relative h-24 w-full rounded-md overflow-hidden bg-neutral-900/40 select-none">
        <div class="absolute left-0 top-[55%] -translate-y-1/2 h-2 w-full bg-neutral-700 rounded-full"></div>
        ${visibleSegments
          .map(s => {
            const left = ((s.start - rangeStart) / visibleRange) * 100;
            const width = ((s.end - s.start) / visibleRange) * 100;
            const color = s.type === "video" ? "bg-emerald-500" : "bg-red-500/40";
            return `<div class="absolute top-1/2 -translate-y-1/2 h-2 rounded-full ${color}" style="left:${left}%;width:${width}%"></div>`;
          })
          .join("")}
        <div id="timeline-handle" class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md cursor-ew-resize transition-transform active:scale-125"
             style="left:${((currentSec - rangeStart) / visibleRange) * 100}%"></div>
        ${marks
          .map(
            m => `<div class="absolute top-0 text-[10px] text-center text-white/70" style="left:${((m.sec - rangeStart) / visibleRange) * 100}%;">
                    <div class="w-[1px] h-5 bg-white/30 mx-auto"></div><div>${m.label}</div></div>`
          )
          .join("")}
      </div>`;

    // Lazy thumbnails
    const containerEl = slot.querySelector(".relative");
    const seen = new Set();
    const filtered = visibleSegments.filter(s => s.thumbnail && !seen.has(Math.floor(s.start / step)) && seen.add(Math.floor(s.start / step)));
    const batchSize = 6;
    for (let i = 0; i < filtered.length; i += batchSize) {
      const batch = filtered.slice(i, i + batchSize);
      batch.forEach(seg => {
        const bucket = Math.floor(seg.start / step);
        const bucketStart = bucket * step;
        const bucketEnd = bucketStart + step;
        const left = (((bucketStart + bucketEnd) / 2 - rangeStart) / visibleRange) * 100;
        const img = Object.assign(document.createElement("img"), {
          src: seg.thumbnail,
          alt: "thumb",
          className:
            "absolute object-cover border border-neutral-700/70 bg-neutral-800/80 opacity-0 transition-opacity duration-500 rounded-md shadow-[0_2px_5px_rgba(0,0,0,0.6)]",
        });
        img.style.cssText = `top:0%;left:${left}%;width:${((step / visibleRange) * 120)}%;height:${thumbHeight * 0.4}px;transform:translateX(-40%)`;
        img.onload = () => (img.style.opacity = "1");
        containerEl.appendChild(img);
      });
      await new Promise(r => requestIdleCallback(r));
    }
  };

  const updateVideoBySecond = sec => {
    const seg = segments.find(s => sec >= s.start && sec < s.end && s.type === "video");
    if (!seg) return (overlay.style.opacity = "1", videoEl.pause());
    overlay.style.opacity = "0";
    if (videoEl.src !== seg.link) {
      videoEl.src = seg.link;
      videoEl.currentTime = 0;
      applyCameraSettings();
      videoEl.play().catch(() => {});
    }
  };

  // Init
  updateRange();
  if (currentSegment.type === "video") {
    videoEl.src = currentSegment.link;
    videoEl.currentTime = 0;
    applyCameraSettings();
    videoEl.play().catch(() => {});
  } else overlay.style.opacity = "1";

  // Events
  slot.onmousedown = e => e.target.id === "timeline-handle" && (isDragging = true);
  window.onmouseup = () => (isDragging = false);
  window.onmousemove = e => {
    if (!isDragging) return;
    const rect = slot.getBoundingClientRect();
    currentSec = rangeStart + (Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width) * visibleRange;
    slot.querySelector("#timeline-handle").style.left = `${((currentSec - rangeStart) / visibleRange) * 100}%`;
    updateVideoBySecond(currentSec);
  };
  slot.onclick = e => {
    if (e.target.id === "timeline-handle") return;
    const rect = slot.getBoundingClientRect();
    currentSec = rangeStart + (Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width) * visibleRange;
    slot.querySelector("#timeline-handle").style.left = `${((currentSec - rangeStart) / visibleRange) * 100}%`;
    updateVideoBySecond(currentSec);
  };

  slot.onwheel = e => {
    e.preventDefault();
    currentZoom = e.deltaY < 0
      ? Math.min(currentZoom + 1, zoomLevels.length)
      : Math.max(currentZoom - 1, 1);

    updateRange();
    drawTimeline();
  };

  // Time & auto-next
  videoEl.ontimeupdate = () => {
    if (!videoEl.duration || isDragging || currentSegment.type !== "video") return;
    currentSec = currentSegment.start + (videoEl.currentTime / videoEl.duration) * (currentSegment.end - currentSegment.start);
    slot.querySelector("#timeline-handle").style.left = `${((currentSec - rangeStart) / visibleRange) * 100}%`;
  };

  videoEl.onended = () => {
    const next = segments.slice(segments.indexOf(currentSegment) + 1).find(s => s.type === "video");
    if (!next) return (overlay.style.opacity = "1");
    currentSegment = next;
    currentSec = next.start;
    updateRange();
    videoEl.src = next.link;
    videoEl.currentTime = 0;
    applyCameraSettings();
    videoEl.play().catch(() => {});
    drawTimeline();
  };

  drawTimeline();
}

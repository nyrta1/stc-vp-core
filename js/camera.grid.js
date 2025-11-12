/**
 * camera.grid.js
 * 🎥 Сетка камер с двумя группами контролов (левая / правая)
 * ✅ Группы прижаты к краям, без багов и исчезновений
 */

export function createCameraCard({ id, name, location, iframeUrl }, isArchivePage) {
  const div = document.createElement("div");
  div.className =
    "relative bg-neutral-800 rounded-xl shadow-lg flex flex-col overflow-hidden";
  div.dataset.camId = id;

  const showIfArchive = (html) => (isArchivePage ? html : "");
  const showIfLive = (html) => (!isArchivePage ? html : "");

  const mediaContent = isArchivePage
    ? `
      <video class="w-full h-full bg-black cam-video" autoplay muted playsinline crossorigin="anonymous">
        <source src="" type="video/mp4" />
      </video>
      <video id="video-ghost" muted playsinline crossorigin="anonymous"
             class="absolute inset-0 w-full h-full opacity-0 pointer-events-none select-none"></video>
    `
    : `
      <iframe class="w-full h-full bg-black cam-iframe pointer-events-none"
              src="${iframeUrl}" allow="autoplay" frameborder="0"></iframe>
    `;

  div.innerHTML = `
    ${mediaContent}

    <!-- Верхняя панель -->
    <div class="absolute top-0 left-0 right-0 h-10 flex items-center px-3
            bg-black/50 text-sm font-medium cursor-grab z-10 cam-header
            active:cursor-grabbing select-none">
      <!-- ЛЕВО -->
      <div class="flex items-center gap-2 font-semibold w-1/3 min-w-[160px]">
        <i class="fa-solid fa-video"></i>
        <span class="truncate">${name}</span>
      </div>

      <!-- ЦЕНТР -->
      <div class="flex items-center justify-center gap-2 w-1/3 text-neutral-300">
        <i class="fa-solid fa-crosshairs"></i>
        <span class="truncate">${location}</span>
      </div>

      <!-- ПРАВО -->
      <div class="flex items-center justify-end gap-2 w-1/3 text-xs">
        <div class="flex items-center gap-2 text-emerald-400 font-semibold animate-pulse">
          <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#00ff88]"></span>
          В СЕТИ
        </div>
      </div>
    </div>

    <!-- Нижняя панель -->
    <div class="absolute bottom-0 left-0 right-0 bg-black/40 text-xs z-10 flex flex-col">
      <div class="flex items-center justify-between px-2 h-11">
        <!-- GROUP 1 вставляется сюда -->
        <div data-controls-left></div>
        <!-- GROUP 2 -->
        <div class="flex items-center gap-2 flex-wrap justify-end" data-controls></div>
      </div>
    </div>
  `;

  // вставляем обе группы
  const leftWrapper = div.querySelector("[data-controls-left]");
  const rightWrapper = div.querySelector("[data-controls]");
  const { group1, group2 } = createCameraControls(isArchivePage);
  leftWrapper.appendChild(group1);
  rightWrapper.appendChild(group2);

  return div;
}

/**
 * 🧭 Контролы камеры (левая + правая группы)
 */
function createCameraControls(isArchivePage) {
  // === GROUP 1 (ЛЕВАЯ) ===
  const group1 = document.createElement("div");
  group1.className = "flex items-center gap-2";

  group1.innerHTML = `
    <button data-mic title="Звук"
      class="w-6 h-6 flex items-center justify-center rounded-md bg-black/50 border border-white/20 hover:bg-white/20 transition">
      <i class="fa-solid fa-microphone"></i>
    </button>
    ${isArchivePage
      ? `<button data-playpause title="Пауза / Пуск"
           class="w-6 h-6 flex items-center justify-center rounded-md bg-black/50 border border-white/20 hover:bg-white/20 transition">
           <i class="fa-solid fa-pause"></i>
         </button>`
      : ""}
  `;

  // зум-дропдаун
  const zoomDropdown = makeDropdown("fa-magnifying-glass", [
    `<button data-zoom-in title="Zoom In"
      class="w-6 h-6 flex items-center justify-center rounded-md bg-black/50 border border-white/20 hover:bg-white/20 transition">
      <i class="fa-solid fa-magnifying-glass-plus"></i></button>`,
    `<button data-zoom-out title="Zoom Out"
      class="w-6 h-6 flex items-center justify-center rounded-md bg-black/50 border border-white/20 hover:bg-white/20 transition">
      <i class="fa-solid fa-magnifying-glass-minus"></i></button>`,
  ]);
  group1.append(zoomDropdown);

  // снимок
  const screenshot = document.createElement("button");
  screenshot.dataset.screenshot = "";
  screenshot.title = "Снимок";
  screenshot.className =
    "w-6 h-6 flex items-center justify-center rounded-md bg-black/50 border border-white/20 hover:bg-white/20 transition";
  screenshot.innerHTML = `<i class="fa-solid fa-camera"></i>`;
  group1.append(screenshot);

  // === GROUP 2 (ПРАВАЯ) ===
  const group2 = document.createElement("div");
  group2.className = "flex items-center gap-2";

  if (isArchivePage) {
    const speedDropdown = makeDropdown("fa-gauge-high", [
      ...[0.5, 1, 2, 4, 8, 16].map(
        (s) => `
        <button data-speed="${s}" title="${s}×"
          class="w-6 h-6 flex items-center justify-center rounded-md border border-white/20
          ${s === 1 ? "bg-white/25" : "bg-black/50 hover:bg-white/20"}
          text-white transition text-[10px] font-semibold">${s}</button>`
      ),
    ]);
    group2.append(speedDropdown);
  }

  // скачать
  const downloadBtn = document.createElement("button");
  downloadBtn.dataset.download = "";
  downloadBtn.title = "Скачать";
  downloadBtn.className =
    "flex items-center gap-1 px-2 h-6 rounded-md bg-black/50 border border-white/20 hover:bg-white/20 transition text-[11px] font-semibold";
  downloadBtn.innerHTML = `<i class="fa-solid fa-file-arrow-down"></i><span>Скачать</span>`;
  group2.append(downloadBtn);

  // полный экран
  const expand = document.createElement("button");
  expand.dataset.expand = "";
  expand.title = "Полный экран";
  expand.className =
    "w-6 h-6 flex items-center justify-center rounded-md bg-black/50 border border-white/20 hover:bg-white/20 transition";
  expand.innerHTML = `<i class="fa-solid fa-expand"></i>`;
  group2.append(expand);

  return { group1, group2 };
}

/**
 * 🧩 Дропдаун-иконка
 */
function makeDropdown(iconClass, itemsHtml) {
  const container = document.createElement("div");
  container.className = "relative";
  container.innerHTML = `
    <button title="Ещё"
      class="w-6 h-6 flex items-center justify-center rounded-md bg-black/50
             border border-white/20 hover:bg-white/20 transition">
      <i class="fa-solid ${iconClass}"></i>
    </button>
    <div class="absolute bottom-full right-0 mb-2 hidden bg-black/90 rounded-lg
                border border-white/20 p-2 flex flex-wrap gap-1 z-20
                transition-all duration-150 ease-out origin-bottom-right
                scale-95 opacity-0 dropdown-menu">
      ${itemsHtml.join("")}
    </div>
  `;
  const toggle = container.querySelector("button");
  const menu = container.querySelector(".dropdown-menu");

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = !menu.classList.contains("hidden");
    document.querySelectorAll(".dropdown-menu").forEach((el) => {
      if (el !== menu) el.classList.add("hidden", "scale-95", "opacity-0");
    });
    if (!isVisible) {
      menu.classList.remove("hidden", "scale-95", "opacity-0");
      menu.classList.add("scale-100", "opacity-100");
    } else {
      menu.classList.add("hidden", "scale-95", "opacity-0");
    }
  });

  menu.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn) {
      btn.classList.add("scale-90");
      setTimeout(() => btn.classList.remove("scale-90"), 120);
    }
  });

  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      menu.classList.add("hidden", "scale-95", "opacity-0");
    }
  });

  return container;
}

/**
 * 🧱 Рендер сетки
 */
export function renderCameraGrid(container, data, isArchivePage) {
  if (!container) return;
  container.innerHTML = "";
  window.cameraData = data;

  const count = data.length;
  let cols = "grid-cols-2";
  if (count === 1) cols = "grid-cols-1";
  else if (count === 4) cols = "grid-cols-2";
  else if (count === 6) cols = "grid-cols-3";
  else if (count > 4) cols = "grid-cols-4";

  container.className = `grid ${cols} gap-2 w-full h-full overflow-hidden`;
  data.forEach((cam) => container.appendChild(createCameraCard(cam, isArchivePage)));
}

/**
 * Drag & Drop модуль для сетки камер.
 * SRP — управляет только порядком DOM-элементов.
 * Можно таскать только за .cam-header, остальная часть игнорируется.
 */
export function enableCameraDrag(container) {
  if (!container) return;

  let dragSrcEl = null;

  const cards = container.querySelectorAll("[data-cam-id]");
  cards.forEach((card) => {
    const header = card.querySelector(".cam-header");
    if (!header) return;

    // делаем только шапку перетаскиваемой
    header.setAttribute("draggable", "true");
    card.setAttribute("draggable", "false");

    // начало перетаскивания
    header.addEventListener("dragstart", (e) => {
      dragSrcEl = card;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", card.dataset.camId);
      card.classList.add("opacity-40", "ring-2", "ring-emerald-400");
    });

    // при наведении на другую карточку
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (card !== dragSrcEl) card.classList.add("ring-2", "ring-emerald-500");
    });

    // покидаем карточку
    card.addEventListener("dragleave", () => {
      card.classList.remove("ring-2", "ring-emerald-500");
    });

    // отпускание
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("ring-2", "ring-emerald-500");

      if (dragSrcEl && dragSrcEl !== card) {
        const parent = container;
        const draggedIndex = [...parent.children].indexOf(dragSrcEl);
        const targetIndex = [...parent.children].indexOf(card);

        if (draggedIndex < targetIndex) {
          parent.insertBefore(dragSrcEl, card.nextSibling);
        } else {
          parent.insertBefore(dragSrcEl, card);
        }
      }
    });

    // завершение
    header.addEventListener("dragend", () => {
      card.classList.remove("opacity-40", "ring-2", "ring-emerald-400");
      dragSrcEl = null;
    });
  });
}

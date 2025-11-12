/**
 * camera.expand.js
 * "Псевдо-fullscreen" без системного F11.
 * Карточка камеры растягивается на весь экран сайта, поверх всего.
 */
export function enableCameraExpand(container) {
  if (!container) return;

  let activeCard = null;

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[title='Полный экран']");
    if (!btn) return;

    const card = btn.closest("[data-cam-id]");
    if (!card) return;

    const icon = btn.querySelector("i");

    // если уже раскрыта — свернуть
    if (activeCard === card) {
      collapseCard(card, icon);
      activeCard = null;
      return;
    }

    // свернуть предыдущую, если есть
    if (activeCard && activeCard !== card) {
      const prevIcon = activeCard.querySelector("[title='Полный экран'] i");
      collapseCard(activeCard, prevIcon);
    }

    expandCard(card, icon);
    activeCard = card;
  });

  // выход по Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeCard) {
      const icon = activeCard.querySelector("[title='Полный экран'] i");
      collapseCard(activeCard, icon);
      activeCard = null;
    }
  });
}

function expandCard(card, icon) {
  // сохраняем позицию
  card.dataset.prevStyle = card.getAttribute("style") || "";

  card.classList.add("z-50", "rounded-none", "transition-all", "duration-300");
  Object.assign(card.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#000",
  });

  if (icon) {
    icon.classList.remove("fa-expand");
    icon.classList.add("fa-compress");
  }

  // блокируем скролл
  document.body.style.overflow = "hidden";
}

function collapseCard(card, icon) {
  card.classList.remove("z-50", "rounded-none", "transition-all", "duration-300");

  // возвращаем стиль
  card.setAttribute("style", card.dataset.prevStyle || "");
  delete card.dataset.prevStyle;

  if (icon) {
    icon.classList.remove("fa-compress");
    icon.classList.add("fa-expand");
  }

  // возвращаем скролл
  document.body.style.overflow = "";
}

/**
 * Утилиты для работы с временными шкалами
 */

/** Форматирует секунды в HH:MM */
export function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Вычисляет шаг деления в зависимости от диапазона */
export function calcStep(spanSec) {
  let step = 3600;
  if (spanSec < 21600 && spanSec >= 3600) step = 600;
  if (spanSec < 3600 && spanSec >= 1800) step = 300;
  if (spanSec < 1800) step = 60;
  return step;
}

/** Генерация временных меток */
export function generateTimeMarks(spanSec = 86400, zoom = 1) {
  const visibleSpan = spanSec / zoom;
  const step = calcStep(visibleSpan);
  const marks = [];
  for (let s = 0; s <= spanSec; s += step) {
    marks.push({ sec: s, label: formatTime(s) });
  }
  return marks;
}

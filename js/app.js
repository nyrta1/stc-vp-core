
import { disablePageZoom } from "./app.nozoom.js";
import { renderCameraGrid } from "./camera.grid.js";
import { enableCameraDrag } from "./camera.drag.js";
import { enableCameraExpand } from "./camera.expand.js";
import { enableCameraSound } from "./camera.sound.js";
import { enableTimelineController } from "./camera.timeline.controller.js";
import { enableCameraSpeed } from "./camera.speed.js";
import { enableCameraScreenshot } from "./camera.screenshot.js";
import { enableCameraPlayPause } from "./camera.playpause.js";
import { enableCameraZoom } from "./camera.zoom.js";
import { enableTimelinePreview } from "./camera.timeline.preview.js";

window.addEventListener("DOMContentLoaded", () => {
  disablePageZoom();

  const app = document.getElementById("app");
  const { cameras, isArchivePage } = window.CAMERA_DATA;
  const data = cameras.map((c) => c.json);

  renderCameraGrid(app, data, isArchivePage);
  enableCameraDrag(app);
  enableCameraExpand(app);
  enableCameraSound(app, data);
  enableTimelineController(app, data, isArchivePage);
  enableCameraSpeed(app, data);
  enableCameraScreenshot(app);
  enableCameraZoom(app);
  enableCameraPlayPause(app);
  // enableTimelinePreview(app);
});

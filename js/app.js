
import { disablePageZoom } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/app.nozoom.js";
import { renderCameraGrid } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/camera.grid.js";
import { enableCameraDrag } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/camera.drag.js";
import { enableCameraExpand } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/camera.expand.js";
import { enableCameraSound } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/camera.sound.js";
import { enableTimelineController } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/camera.timeline.controller.js";
import { enableCameraSpeed } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/camera.speed.js";
import { enableCameraScreenshot } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/camera.screenshot.js";
import { enableCameraPlayPause } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/camera.playpause.js";
import { enableCameraZoom } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/camera.zoom.js";
import { enableTimelinePreview } from "https://raw.githubusercontent.com/nyrta1/stc-vp-core/refs/heads/v1/js/camera.timeline.preview.js";

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

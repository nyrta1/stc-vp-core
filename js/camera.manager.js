import Camera from "./camera.model.js";

export default class CameraManager {
  constructor() {
    this.cameras = new Map();
  }

  addCamera(config, element) {
    const cam = new Camera({ ...config, element });
    this.cameras.set(cam.id, cam);
  }

  getCamera(id) {
    return this.cameras.get(id);
  }

  removeCamera(id) {
    this.cameras.delete(id);
  }

  muteAll(state = true) {
    this.cameras.forEach((cam) => {
      cam.isMuted = state;
      if (cam.videoEl) cam.videoEl.muted = state;
    });
  }

  serializeAll() {
    return Array.from(this.cameras.values()).map((c) => c.serialize());
  }
}

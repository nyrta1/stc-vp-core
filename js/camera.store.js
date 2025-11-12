import Camera from "./camera.model.js";

export const CameraStore = {
  list: [],
  add(camera) {
    this.list.push(camera);
  },
  getById(id) {
    return this.list.find(c => c.id === id);
  },
  getAll() {
    return this.list;
  },
  initFromData(data) {
    this.list = data.map(cfg => new Camera({
      id: cfg.json.id,
      name: cfg.json.name,
      location: cfg.json.location,
      iframeUrl: cfg.json.iframeUrl,
      archiveUrls: cfg.json.videoArchiveUrlList || [],
    }));
  },
};

export default class Camera {
  constructor({
    id,
    name,
    location,
    iframeUrl,
    archiveUrls = [],
    element = null,
  }) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.iframeUrl = iframeUrl;
    this.archiveUrls = archiveUrls;
    this.element = element;
    this.videoEl = null;
    this.iframeEl = null;
    this.isPlaying = false;
    this.isMuted = true;
    this.isFullscreen = false;
    this.zoom = 1.0;
    this.playbackRate = 1.0;
    this.offset = { x: 0, y: 0 };
    this.timeline = {
      startDate: null,
      endDate: null,
      range: [0, 100],
      segments: [],
    };
  }

  bindElements() {
    if (!this.element) return;
    this.videoEl = this.element.querySelector("video.cam-video");
    this.iframeEl = this.element.querySelector("iframe.cam-iframe");
  }

  play(url = null) {
    this.bindElements();
    if (!this.videoEl) return;
    if (url) this.videoEl.src = url;
    this.videoEl.playbackRate = this.playbackRate;
    this.videoEl.muted = this.isMuted;
    this.videoEl.play().catch(() => {});
    this.isPlaying = true;
  }

  pause() {
    if (!this.videoEl) return;
    this.videoEl.pause();
    this.isPlaying = false;
  }

  toggleMute() {
    if (!this.videoEl) return;
    this.isMuted = !this.isMuted;
    this.videoEl.muted = this.isMuted;
  }

  setSpeed(rate) {
    const validRates = [0.5, 1, 1.5, 2, 4, 8, 16, 32];
    if (!validRates.includes(rate)) return;
    this.playbackRate = rate;
    if (this.videoEl) this.videoEl.playbackRate = rate;
  }

  setZoom(scale) {
    this.zoom = Math.max(1, Math.min(16, scale));
    const target = this.videoEl || this.iframeEl;
    if (target) {
      target.style.transform = `scale(${this.zoom})`;
      target.style.transformOrigin = "center center";
    }
  }

  takeScreenshot() {
    if (!this.videoEl || !this.videoEl.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = this.videoEl.videoWidth;
    canvas.height = this.videoEl.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.videoEl, 0, 0);
    return canvas.toDataURL("image/png");
  }

  setTimeline(startDate, endDate, segments = []) {
    this.timeline.startDate = startDate;
    this.timeline.endDate = endDate;
    this.timeline.segments = segments;
  }

  toggleFullscreen() {
    if (!this.element) return;
    this.isFullscreen = !this.isFullscreen;
    this.element.classList.toggle("fakefs", this.isFullscreen);
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      iframeUrl: this.iframeUrl,
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      playbackRate: this.playbackRate,
      zoom: this.zoom,
      timeline: this.timeline,
    };
  }
}

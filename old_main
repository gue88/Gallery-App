// Configuration Constants
const BATCH_SIZE = 15;
const BUFFER_SIZE = 300;
const LOAD_THROTTLE_DELAY = 100;
const WINDOW_SIZE = 3; // How many batches to keep visible at once

class GalleryManager {
  constructor() {
    this.gallery = document.getElementById("gallery");
    this.folderInput = document.getElementById("folderInput");

    this.allFiles = [];
    this.mediaElements = [];
    this.visibleStartBatch = 0;
    this.visibleEndBatch = -1;

    this.isLoadingBatch = false;
    this.observer = null;
    this.loadTimeout = null;

    this.topSentinel = document.createElement("div");
    this.topSentinel.id = "top-sentinel";

    this.bottomSentinel = document.createElement("div");
    this.bottomSentinel.id = "bottom-sentinel";

    this.urlCache = new Map();
    this.lastLoadedDirection = null;

    this.init();
  }

  init() {
    this.folderInput.addEventListener("change", (e) =>
      this.handleFolderSelect(e)
    );
    this.gallery.addEventListener("click", (e) => this.handleGalleryClick(e));

    // Additional scroll event listener to handle large, instant scrolls:
    this.gallery.addEventListener("scroll", () => {
      // If we jump near the top and there's an older batch, load it
      if (
        !this.isLoadingBatch &&
        this.visibleStartBatch > 0 &&
        this.gallery.scrollTop <= BUFFER_SIZE
      ) {
        this.loadPreviousBatch();
      }

      // Similarly, if we jump near the bottom and there's another batch, load it
      const remainingScroll =
        this.gallery.scrollHeight -
        this.gallery.scrollTop -
        this.gallery.clientHeight;
      if (
        !this.isLoadingBatch &&
        (this.visibleEndBatch + 1) * BATCH_SIZE < this.allFiles.length &&
        remainingScroll <= BUFFER_SIZE
      ) {
        this.loadNextBatch();
      }
    });
  }

  async handleFolderSelect(event) {
    this.resetGallery();
    this.allFiles = Array.from(event.target.files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    this.allFiles = this.fisherYatesShuffle(this.allFiles);

    // Add sentinels
    this.gallery.appendChild(this.topSentinel);
    this.gallery.appendChild(this.bottomSentinel);

    this.initializeObserver();
    await this.loadNextBatch(); // Load the first batch
  }

  resetGallery() {
    this.gallery.innerHTML = "";
    this.mediaElements = [];
    this.visibleStartBatch = 0;
    this.visibleEndBatch = -1;
    this.isLoadingBatch = false;
    this.lastLoadedDirection = null;
  }

  batchRange(batchIndex) {
    const start = batchIndex * BATCH_SIZE;
    const end = Math.min((batchIndex + 1) * BATCH_SIZE, this.allFiles.length);
    return { start, end };
  }

  async loadNextBatch() {
    if (this.isLoadingBatch) return;
    const nextBatch = this.visibleEndBatch + 1;
    const { start, end } = this.batchRange(nextBatch);
    if (start >= this.allFiles.length) return;

    this.isLoadingBatch = true;
    const batch = this.allFiles.slice(start, end);

    const fragment = document.createDocumentFragment();
    batch.forEach((file, i) => {
      const container = this.createMediaContainer(file, start + i);
      fragment.appendChild(container);
    });

    this.gallery.insertBefore(fragment, this.bottomSentinel);
    this.observeNewMedia(batch.length);

    this.visibleEndBatch = nextBatch;
    this.lastLoadedDirection = "down";
    this.isLoadingBatch = false;
    this.adjustWindow();
  }

  async loadPreviousBatch() {
    if (this.isLoadingBatch) return;
    const prevBatch = this.visibleStartBatch - 1;
    if (prevBatch < 0) return;

    const { start, end } = this.batchRange(prevBatch);
    if (end <= 0) return;

    this.isLoadingBatch = true;
    const batch = this.allFiles.slice(start, end);

    const fragment = document.createDocumentFragment();
    batch.forEach((file, i) => {
      const container = this.createMediaContainer(file, start + i);
      fragment.appendChild(container);
    });

    this.gallery.insertBefore(fragment, this.topSentinel.nextSibling);
    this.observeNewMedia(batch.length);

    this.visibleStartBatch = prevBatch;
    this.lastLoadedDirection = "up";
    this.isLoadingBatch = false;
    this.adjustWindow();
  }

  createMediaContainer(file, index) {
    const container = document.createElement("div");
    container.classList.add("media-container");

    const media = file.type.startsWith("image/")
      ? new Image()
      : document.createElement("video");

    media.file = file;
    media.alt = file.name;
    media.loading = "lazy";
    media.dataset.index = index;

    if (media.tagName.toLowerCase() === "video") {
      media.muted = false;
      media.loop = false;
      media.playsInline = true;
      media.controls = true;
    }

    container.appendChild(media);
    this.mediaElements.push(media);
    return container;
  }

  initializeObserver() {
    if ("IntersectionObserver" in window && !this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersections(entries),
        {
          rootMargin: `${BUFFER_SIZE}px 0px ${BUFFER_SIZE}px 0px`,
          threshold: 0.1,
        }
      );
      this.observer.observe(this.topSentinel);
      this.observer.observe(this.bottomSentinel);
    }
  }

  handleIntersections(entries) {
    entries.forEach((entry) => {
      const element = entry.target;
      if (element.id === "bottom-sentinel" && entry.isIntersecting) {
        this.throttleLoad("next");
      } else if (element.id === "top-sentinel" && entry.isIntersecting) {
        this.throttleLoad("previous");
      } else if (entry.isIntersecting) {
        if (element.tagName === "IMG" || element.tagName === "VIDEO") {
          this.loadMedia(element);
        }
      }
    });
  }

  throttleLoad(direction) {
    if (this.loadTimeout) clearTimeout(this.loadTimeout);
    this.loadTimeout = setTimeout(() => {
      this.loadTimeout = null;
      if (direction === "next") {
        this.loadNextBatch();
      } else if (direction === "previous") {
        this.loadPreviousBatch();
      }
    }, LOAD_THROTTLE_DELAY);
  }

  loadMedia(media) {
    if (!media.src && media.file) {
      let url = this.urlCache.get(media.file);
      if (!url) {
        url = URL.createObjectURL(media.file);
        this.urlCache.set(media.file, url);
      }
      media.src = url;
      media.dataset.src = url;
      media.classList.add("lazy-loaded");
    }
  }

  observeNewMedia(count) {
    const newElements = this.mediaElements.slice(
      this.mediaElements.length - count
    );
    newElements.forEach((media) => {
      this.observer.observe(media);
    });
  }

  adjustWindow() {
    const visibleCount = this.visibleEndBatch - this.visibleStartBatch + 1;
    if (visibleCount <= WINDOW_SIZE) return;

    if (this.lastLoadedDirection === "down") {
      this.removeBatch(this.visibleStartBatch);
      this.visibleStartBatch++;
    } else if (this.lastLoadedDirection === "up") {
      this.removeBatch(this.visibleEndBatch);
      this.visibleEndBatch--;
    }
  }

  removeBatch(batchIndex) {
    const { start, end } = this.batchRange(batchIndex);
    const elementsToRemove = this.mediaElements.filter((m) => {
      const fileIndex = parseInt(m.dataset.index, 10);
      return fileIndex >= start && fileIndex < end;
    });

    elementsToRemove.forEach((media) => {
      const container = media.parentNode;
      if (container && container.parentNode) {
        this.observer.unobserve(media);
        container.parentNode.removeChild(container);
      }
      this.mediaElements = this.mediaElements.filter((elem) => elem !== media);
    });
  }

  handleGalleryClick(event) {
    // Placeholder for integrating a third-party lightbox if needed
  }

  fisherYatesShuffle(array) {
    let m = array.length,
      t,
      i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new GalleryManager();
});

document
  .getElementById("folderInput")
  .addEventListener("change", handleFolderSelect);

const gallery = document.getElementById("gallery");
const overlay = document.getElementById("overlay");
const overlayImage = document.getElementById("overlayImage");

let observer;
let currentImageIndex = 0;
let images = [];
let allFiles = [];
let mediaElements = []; // Store all references to created media elements
const BATCH_SIZE = 20;
let currentBatch = 0;
let isLoadingBatch = false;
const BUFFER_SIZE = 300; // pixels above and below viewport to keep loaded
const UNLOAD_DISTANCE = 500; // Distance at which media will be unloaded

// Variables for requestAnimationFrame-based scroll handling
let scrollRequested = false;

async function handleFolderSelect(event) {
  gallery.innerHTML = "";
  mediaElements = [];
  allFiles = Array.from(event.target.files).filter(
    (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
  );
  allFiles = fisherYatesShuffle(allFiles);
  currentBatch = 0;
  initializeObserver();
  await loadNextBatch();
  window.addEventListener("scroll", requestScrollUpdate);
}

async function loadNextBatch() {
  if (isLoadingBatch || currentBatch * BATCH_SIZE >= allFiles.length) return;

  isLoadingBatch = true;
  const start = currentBatch * BATCH_SIZE;
  const end = Math.min((currentBatch + 1) * BATCH_SIZE, allFiles.length);
  const batch = allFiles.slice(start, end);

  const fragment = document.createDocumentFragment();
  for (const file of batch) {
    const container = createMediaElement(file);
    fragment.appendChild(container);
  }

  gallery.appendChild(fragment);
  // Only observe the newly added elements
  observeMedia(batch.length);
  currentBatch++;
  isLoadingBatch = false;
}

function createMediaElement(file) {
  const container = document.createElement("div");
  container.classList.add("media-container");

  const media = file.type.startsWith("image/")
    ? new Image()
    : document.createElement("video");

  media.dataset.src = "";
  media.file = file;
  media.alt = file.name;
  media.loading = "lazy";

  if (file.type.startsWith("image/")) {
    media.addEventListener("click", () => expandImage(media));
  } else {
    media.muted = false;
    media.loop = false;
    media.playsInline = true;
    media.controls = true;
  }

  container.appendChild(media);
  mediaElements.push(media);

  return container;
}

function initializeObserver() {
  if ("IntersectionObserver" in window && !observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const media = entry.target;
          if (entry.isIntersecting) {
            loadMedia(media);
            preloadAdjacentMedia(media);
          } else {
            const rect = entry.boundingClientRect;
            if (
              rect.top < -UNLOAD_DISTANCE ||
              rect.bottom > window.innerHeight + UNLOAD_DISTANCE
            ) {
              unloadMedia(media);
            }
          }
        });
      },
      {
        rootMargin: `${BUFFER_SIZE}px 0px ${BUFFER_SIZE}px 0px`,
        threshold: 0.1,
      }
    );
  }
}

function preloadAdjacentMedia(media) {
  const index = mediaElements.indexOf(media);
  if (index > 0) {
    loadMedia(mediaElements[index - 1]);
  }
  if (index < mediaElements.length - 1) {
    loadMedia(mediaElements[index + 1]);
  }
}

function loadMedia(media) {
  if (!media.src && media.file) {
    media.src = URL.createObjectURL(media.file);
    media.dataset.src = media.src;
    media.classList.add("lazy-loaded");
  }
}

function unloadMedia(media) {
  if (media.src) {
    URL.revokeObjectURL(media.src);
    media.removeAttribute("src");
    media.removeAttribute("data-src");
    media.classList.remove("lazy-loaded");
    if (media.tagName.toLowerCase() === "video") {
      media.pause();
    }
  }
}

function observeMedia(count) {
  // Observe only the new elements added in the last batch
  const newElements = mediaElements.slice(mediaElements.length - count);
  newElements.forEach((media) => {
    observer.observe(media);
  });
}

// Scroll handling with requestAnimationFrame for performance
function requestScrollUpdate() {
  if (!scrollRequested) {
    scrollRequested = true;
    requestAnimationFrame(handleScrollFrame);
  }
}

function handleScrollFrame() {
  scrollRequested = false;
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 1000
  ) {
    loadNextBatch();
  }
}

function expandImage(img) {
  if (!img.src) {
    img.src = URL.createObjectURL(img.file);
  }
  overlayImage.src = img.src;
  overlay.classList.add("active");
  overlay.addEventListener("click", closeImage);

  images = mediaElements.filter((el) => el.tagName.toLowerCase() === "img");
  currentImageIndex = images.indexOf(img);

  document.addEventListener("keydown", handleKeyDown);
}

function closeImage(event) {
  if (event.target !== overlayImage) {
    overlay.classList.remove("active");
    overlayImage.src = "";
    document.removeEventListener("keydown", handleKeyDown);
    overlay.removeEventListener("click", closeImage);
  }
}

function handleKeyDown(event) {
  if (overlay.classList.contains("active")) {
    if (event.key === "ArrowLeft" && currentImageIndex > 0) {
      currentImageIndex--;
    } else if (
      event.key === "ArrowRight" &&
      currentImageIndex < images.length - 1
    ) {
      currentImageIndex++;
    }

    const currentImg = images[currentImageIndex];
    if (!currentImg.src) {
      currentImg.src = URL.createObjectURL(currentImg.file);
    }
    overlayImage.src = currentImg.src;
  }
}

function fisherYatesShuffle(array) {
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

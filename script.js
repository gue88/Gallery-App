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
const BATCH_SIZE = 20;
let currentBatch = 0;
let isLoadingBatch = false;
const BUFFER_SIZE = 300; // pixels above and below viewport to keep loaded
const UNLOAD_DISTANCE = 500; // Distance at which media will be unloaded

async function handleFolderSelect(event) {
  gallery.innerHTML = "";
  allFiles = Array.from(event.target.files).filter(
    (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
  );
  allFiles = fisherYatesShuffle(allFiles);
  currentBatch = 0;
  initializeObserver(); // Call observer initialization before loading media
  // Load the first batch on folder select
  await loadNextBatch();
  window.addEventListener("scroll", handleScroll);
}

async function loadNextBatch() {
  if (isLoadingBatch || currentBatch * BATCH_SIZE >= allFiles.length) return;

  isLoadingBatch = true;
  const start = currentBatch * BATCH_SIZE;
  const end = Math.min((currentBatch + 1) * BATCH_SIZE, allFiles.length);
  const batch = allFiles.slice(start, end);

  const fragment = document.createDocumentFragment();
  for (const file of batch) {
    const container = await createMediaElement(file);
    fragment.appendChild(container);
  }

  gallery.appendChild(fragment);
  currentBatch++;
  isLoadingBatch = false;
  // Start observing new media elements after loading a batch
  observeMedia();
}

async function createMediaElement(file) {
  const container = document.createElement("div");
  container.classList.add("media-container");

  const media = file.type.startsWith("image/")
    ? new Image()
    : document.createElement("video");
  media.dataset.src = ""; // We'll set src when loading the media
  media.file = file; // Store the file reference
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
  return container;
}

function initializeObserver() {
  if ("IntersectionObserver" in window && !observer) {
    observer = new IntersectionObserver(
      (entries, observer) => {
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
  const mediaElements = Array.from(
    document.querySelectorAll(".media-container img, .media-container video")
  );
  const index = mediaElements.indexOf(media);

  if (index > 0) {
    loadMedia(mediaElements[index - 1]);
  }
  if (index < mediaElements.length - 1) {
    loadMedia(mediaElements[index + 1]);
  }
}

function loadMedia(media) {
  if (!media.src) {
    // Ensure src is properly set when the media enters the viewport
    media.src = URL.createObjectURL(media.file);
    media.dataset.src = media.src; // Update dataset for consistency
    media.classList.add("lazy-loaded");
  }
}

function unloadMedia(media) {
  if (media.src) {
    // Revoke the object URL to free up memory
    URL.revokeObjectURL(media.src);
    media.removeAttribute("src");
    media.removeAttribute("data-src");
    media.classList.remove("lazy-loaded");

    // Pause the video if it is a video element
    if (media.tagName.toLowerCase() === "video") {
      media.pause();
    }
  }
}

function observeMedia() {
  document
    .querySelectorAll(".media-container img, .media-container video")
    .forEach((media) => {
      observer.observe(media);
    });
}

function handleScroll() {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 1000
  ) {
    loadNextBatch();
  }
}

function expandImage(img) {
  // Recreate the object URL if needed
  if (!img.src) {
    img.src = URL.createObjectURL(img.file);
  }
  overlayImage.src = img.src;
  overlay.classList.add("active");

  // Ensure only clicking on the overlay background closes the image
  overlay.addEventListener("click", closeImage);

  images = Array.from(gallery.querySelectorAll("img"));
  currentImageIndex = images.indexOf(img);

  document.addEventListener("keydown", handleKeyDown);
}

function closeImage(event) {
  // Close only if the click is not on the image itself
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
    // Recreate the object URL if needed
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

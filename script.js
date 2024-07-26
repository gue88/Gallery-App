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
const BATCH_SIZE = 100;
let currentBatch = 0;
let isLoadingBatch = false;

async function handleFolderSelect(event) {
  gallery.innerHTML = "";
  allFiles = Array.from(event.target.files).filter((file) =>
    file.type.startsWith("image/")
  );
  allFiles = fisherYatesShuffle(allFiles);
  currentBatch = 0;
  await loadNextBatch();
  initializeObserver();
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
    const container = await createImageElement(file);
    fragment.appendChild(container);
  }

  gallery.appendChild(fragment);
  currentBatch++;
  isLoadingBatch = false;

  if (end < allFiles.length) {
    requestAnimationFrame(loadNextBatch);
  }
}

async function createImageElement(file) {
  const container = document.createElement("div");
  container.classList.add("image-container");

  const img = new Image();
  img.dataset.src = URL.createObjectURL(file);
  img.alt = file.name;
  img.loading = "lazy";
  img.addEventListener("click", () => expandImage(img));

  container.appendChild(img);
  return container;
}

function initializeObserver() {
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add("lazy-loaded");
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: "200px" }
    );

    observeImages();
  }
}

function observeImages() {
  document
    .querySelectorAll('img[loading="lazy"]:not(.lazy-loaded)')
    .forEach((img) => {
      observer.observe(img);
    });
}

function handleScroll() {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 1000
  ) {
    loadNextBatch();
  }
  observeImages();
}

function expandImage(img) {
  overlayImage.src = img.src || img.dataset.src;
  overlay.classList.add("active");
  overlay.addEventListener("click", closeImage);

  images = Array.from(gallery.querySelectorAll("img"));
  currentImageIndex = images.indexOf(img);

  document.addEventListener("keydown", handleKeyDown);
}

function closeImage(event) {
  if (event.target !== overlayImage) {
    overlay.classList.remove("active");
    overlayImage.src = "";
    document.removeEventListener("keydown", handleKeyDown);
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
    overlayImage.src = currentImg.src || currentImg.dataset.src;
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

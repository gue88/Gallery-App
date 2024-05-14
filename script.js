document
  .getElementById("folderInput")
  .addEventListener("change", handleFolderSelect);
const gallery = document.getElementById("gallery");
const overlay = document.getElementById("overlay");
const overlayImage = document.getElementById("overlayImage");

let observer;
let currentImageIndex = 0;
let images = [];

function handleFolderSelect(event) {
  const files = Array.from(event.target.files).filter((file) =>
    file.type.startsWith("image/")
  );
  const shuffledFiles = fisherYatesShuffle(files);
  const fragment = document.createDocumentFragment();

  shuffledFiles.forEach((file) => {
    const container = createImageElement(file);
    fragment.appendChild(container);
  });

  gallery.innerHTML = "";
  gallery.appendChild(fragment);

  initializeObserver();
}

function createImageElement(file) {
  const container = document.createElement("div");
  container.classList.add("image-container");

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.loading = "lazy";
  img.addEventListener("click", () => expandImage(img));

  container.appendChild(img);
  return container;
}

function initializeObserver() {
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.src;
          img.classList.add("lazy-loaded");
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      observer.observe(img);
    });
  }
}

function expandImage(img) {
  overlayImage.src = img.src;
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
    overlayImage.src = images[currentImageIndex].src;
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

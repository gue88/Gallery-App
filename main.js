import { GalleryManager } from "./GalleryManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const galleryElement = document.getElementById("gallery");
  const folderInputElement = document.getElementById("folderInput");
  new GalleryManager(galleryElement, folderInputElement);
});

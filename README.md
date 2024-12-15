# Image Gallery App

This **Image Gallery App** allows users to upload and view media files (images and videos) from their local system. It efficiently handles large numbers of files through lazy loading, infinite scrolling, and batch processing. Images are integrated with a lightbox for enhanced viewing.

---

## Features

- **Batch Loading**: Dynamically loads media in small batches to optimize performance.
- **Lazy Loading**: Only loads media when it's close to the viewport.
- **Infinite Scrolling**: Automatically loads more media as the user scrolls.
- **Lightbox for Images**: Displays images in a beautiful lightbox.
- **Video Support**: Supports playback of video files directly in the gallery.
- **Memory Management**: Unloads offscreen batches to save memory.

---

## Getting Started

### Prerequisites

- Include [FsLightbox](https://fslightbox.com/) for image lightbox functionality:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/fslightbox/index.js"></script>
  ```

### Installation

1. Clone or download this repository.
2. Import the necessary files into your project:
   - `GalleryManager` (main logic for the app).
   - `constants.js` (configurable parameters).
   - `utils.js` (utility functions).

---

## Usage

### 1. HTML Structure

Your HTML should include:

- A container for the gallery.
- A file input for users to select folders containing media files.

```html
<div id="gallery" class="gallery"></div>
<input type="file" id="folder-input" webkitdirectory multiple />
```

### 2. JavaScript Integration

Import and initialize the `GalleryManager`:

```javascript
import { GalleryManager } from "./GalleryManager.js";

const galleryElement = document.getElementById("gallery");
const folderInputElement = document.getElementById("folder-input");

// Initialize the GalleryManager
const galleryManager = new GalleryManager(galleryElement, folderInputElement);
```

---

## How It Works

1. **Folder Selection**: Users select a folder via the file input. The app reads all images and videos within the folder.
2. **Batch Processing**: Files are loaded and displayed in batches for efficiency.
3. **Infinite Scrolling**: As users scroll, the app dynamically loads more media files.
4. **Lazy Loading**: Media files are only loaded when they are close to being visible.
5. **Lightbox Integration**: Clicking an image opens it in a lightbox. Videos are excluded from the lightbox and played inline.

---

## Key Methods and Functionality

### Constructor: `GalleryManager`

Initializes the gallery and sets up event listeners for folder input, scrolling, and clicking.

#### Parameters:

- `galleryElement` (`HTMLElement`): The container for the gallery.
- `folderInputElement` (`HTMLElement`): The file input for folder selection.

### Main Methods:

1. **`handleFolderSelect(event)`**: Processes folder input and starts loading media.
2. **`resetGallery()`**: Clears the gallery and resets internal state.
3. **`loadNextBatch()`**: Loads the next batch of media.
4. **`loadPreviousBatch()`**: Loads the previous batch of media.
5. **`createMediaContainer(file, index)`**: Creates media containers for images and videos.
6. **`initializeObserver()`**: Sets up an `IntersectionObserver` to detect when to load new media.

### Lazy Loading and Infinite Scroll:

The `IntersectionObserver` is used to monitor the top and bottom sentinels. When a sentinel is intersected, the app loads the next or previous batch of media.

---

## Lightbox Integration

The app integrates [FsLightbox](https://fslightbox.com/) for images. Videos are excluded from the lightbox and played inline.

- **Images**: Wrapped in `<a>` with `data-fslightbox` for lightbox functionality.
- **Videos**: Wrapped in `<a>` but excluded from the lightbox.

### Example Output:

- **Image**:

  ```html
  <a data-fslightbox="gallery" href="image1.jpg">
    <img src="image1.jpg" alt="Image 1" />
  </a>
  ```

- **Video**:
  ```html
  <a class="media-container">
    <video controls>
      <source src="video1.mp4" type="video/mp4" />
    </video>
  </a>
  ```

---

## Configurable Parameters

Customize the gallery behavior in `constants.js`:

- **`BATCH_SIZE`**: Number of files to load per batch.
- **`BUFFER_SIZE`**: Pixels of preload before the viewport.
- **`LOAD_THROTTLE_DELAY`**: Delay for throttling load requests (ms).
- **`WINDOW_SIZE`**: Maximum number of batches in memory.

---

## Folder Input Requirements

The file input must support directory selection:

```html
<input type="file" id="folder-input" webkitdirectory multiple />
```

- **`webkitdirectory`**: Allows users to select folders.
- **`multiple`**: Enables multiple file selection.

---

## Extending the App

1. **Custom Lightbox**:
   Replace FsLightbox with your preferred lightbox library if needed.

2. **Additional Media Types**:
   Extend the `handleFolderSelect` filter to include other media types (e.g., audio).

3. **Styling**:
   Customize the gallery’s appearance using CSS.

---

## Known Limitations

- **Browser Support**: `IntersectionObserver` must be supported by the browser.
- **File Sizes**: Performance may degrade with extremely large files or very large directories.

---

## License

This project is open-source and available under the MIT License.

```

This `README.md` is tailored for an image gallery application, covering usage, setup, and key features while focusing on the integration of lightbox functionality.
```

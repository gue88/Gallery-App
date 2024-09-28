# Media Gallery App

This is a web-based media gallery that allows users to upload and view images and videos from a local folder. The app dynamically loads media in batches, using lazy loading to optimize performance, and features a full-screen overlay for viewing individual media items.

## Features
- **Batch Media Loading**: Media files (images and videos) are loaded in batches to improve performance.
- **Lazy Loading**: Media is loaded only when it enters the viewport, improving memory usage and load times.
- **Dynamic Grid Layout**: Media is displayed in a responsive grid layout that adapts to different screen sizes.
- **Media Overlay**: Users can click on an image or video to view it in a full-screen overlay. Clicking outside the media closes the overlay.
- **Keyboard Navigation**: Use arrow keys to navigate between images while in the overlay.

## Demo
You can host this app locally or on any web server. Simply upload a folder of media files (images or videos) and the gallery will display them in a grid layout.

## Technologies Used
- **HTML5**
- **CSS3 (Grid Layout, Flexbox)**
- **JavaScript (ES6)**
- **IntersectionObserver API** for lazy loading
- **FileReader API** for accessing local files

## Installation and Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/media-gallery-app.git
   ```

2. **Navigate to the Project Directory**:
   ```bash
   cd media-gallery-app
   ```

3. **Open `index.html` in a Browser**:
   You can simply open the `index.html` file in your browser or host it on a local web server for a better experience.
   
   For a simple server, you can use Python's built-in HTTP server:
   ```bash
   # Python 3.x
   python3 -m http.server
   
   # or for Python 2.x
   python -m SimpleHTTPServer
   ```

4. **Upload Media**:
   Click on the "Choose Files" button to select multiple images and videos from your local directory. The media will be shuffled and displayed in batches.

## Usage

### Uploading Media
- To add media to the gallery, click the **"Choose Files"** button and select one or more files from your local system.
- Only image (`.jpg`, `.png`, `.gif`) and video (`.mp4`, `.webm`) files are supported.

### Lazy Loading
- The gallery uses **lazy loading** to only load images and videos when they enter the viewport. This is achieved using the **IntersectionObserver API**, which improves performance by reducing memory usage.

### Overlay View
- Clicking on an image or video will open it in a full-screen overlay.
- To close the overlay, click outside the image or video, or press the **Esc** key.
- You can also navigate between images in the overlay using the **Left** and **Right Arrow Keys**.

## Customization

### Grid Layout
You can customize the gallery grid layout by editing the CSS in `style.css`. 
```css
#gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 10px;
  justify-items: center;
  margin: 20px;
}
```
- Adjust the `minmax(200px, 1fr)` to change the minimum size of each grid cell.
- You can modify the `grid-gap` to change the space between media items.

### Batch Size and Lazy Loading Settings
The batch size and lazy loading distances can be customized in the JavaScript file (`script.js`).
```javascript
const BATCH_SIZE = 20; // Number of media items loaded per batch
const BUFFER_SIZE = 300; // Pixels above/below the viewport to load media
const UNLOAD_DISTANCE = 800; // Distance at which media is unloaded
```
- **BATCH_SIZE**: Controls how many images or videos are loaded in each batch.
- **BUFFER_SIZE**: Adjust how close to the viewport media is loaded.
- **UNLOAD_DISTANCE**: Controls how far away media must be from the viewport to be unloaded.

### Overlay Customization
The full-screen overlay is styled in `style.css`. You can adjust the appearance and behavior of the overlay by modifying the following CSS rules:
```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999;
  display: none;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.overlay.active {
  display: flex;
}

.overlay img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}
```

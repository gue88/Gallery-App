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

# GDPS Editor 2.2 Archive - Upload Interface

A fully custom, vanilla web-based file upload interface inspired by the Geometry Dash visual aesthetic. This project focuses on providing an intuitive UI/UX for managing and uploading files, featuring real-time metadata validation and custom file previews.

## Features

* **Custom UI/UX:** Authentic Geometry Dash aesthetic with pixel-perfect styling and animations.
* **Drag & Drop:** Seamless file selection using drag-and-drop or standard browsing.
* **Interactive File Tree:** Grouped view of uploaded files (categorized dynamically based on extensions).
* **Quick Preview (V-Key):** Hold the `V` key while hovering over a file to instantly preview images (`.png`, `.jpg`) and videos (`.mp4`, `.mkv`).
* **Smart Metadata Validation:** Enforces strict validation for level names, authors, and dates (dynamically capped at the current local time to prevent futuristic entries).
* **Mock Upload Mode:** Built-in simulation of the upload process (progress bars, status updates) for frontend testing without a live backend.
* **Responsive Fallback:** Custom error overlay for unsupported viewport sizes to ensure design integrity.

## Tech Stack

Built entirely without external frameworks to ensure maximum performance and demonstrate strong core fundamentals:
* **HTML5** (Semantic structure)
* **CSS3** (Custom properties, Flexbox/Grid, `@font-face`, animations)
* **Vanilla JavaScript (ES6+)** (DOM manipulation, asynchronous operations, event handling, File API)

## Project Structure

```text
Project Root
├── index.html      # Main markup
├── style.css       # All styles and UI logic
├── script.js       # Core application logic and validation
└── assets/         # Local fonts and image assets
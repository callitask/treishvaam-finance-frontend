# Component: ImageCropUploader
**Path:** src/components/ImageCropUploader.js

**Purpose:** UI for uploading and cropping images before upload (thumbnail management).

## Props
- onUpload(file) — callback after successful crop/upload

## Local State
- `selectedFile`, `cropState`, `previewUrl` — manage uploader/crop UI

## Lifecycle / Hooks
- uses `useRef` and `useEffect` to manage canvas/cropper lifecycle

## API Calls
- Calls upload endpoint (see `apiConfig.js`) to send cropped image

## Dependencies
- likely uses a cropping library (e.g., react-easy-crop) — check imports

## Styling
- Tailwind utilities and inline canvas sizing

## Tests
- TODO: add integration tests mocking file selection and upload

## Accessibility
- Ensure file input has accessible label and keyboard focus

## TODO / Suggested Improvements
- Add max-file-size validation and client-side image optimization

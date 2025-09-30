# Component: StoryThumbnailManager
**Path:** src/components/StoryThumbnailManager.js

**Purpose:** UI to upload, crop and manage story/article thumbnails.

## Props
- initialThumbnails, onChange

## Local State
- thumbnails array, selectedIndex, uploadStatus

## Lifecycle / Hooks
- uses `useEffect` to sync changes with parent or persist temp state

## API Calls
- Upload endpoints via `apiConfig.js`

## Dependencies
- `ImageCropUploader` and file input utilities

## Styling
- Tailwind utility classes; thumbnail grid

## Tests
- TODO: integration tests for upload flow

## Accessibility
- Ensure thumbnails have descriptive alt text and keyboard focus

## TODO / Suggested Improvements
- Add server-side validation hooks and client-side preview size checks
